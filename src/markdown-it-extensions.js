'use strict';

const levels = 2;
const openString = '['.repeat(levels);
const closeString = ']'.repeat(levels);
const contentRegex = /\s*([^\s\[\]:]+):?\s*([^\]\n]+)?/i;

module.exports = function(md, templates = {}) {

   md.inline.ruler.after('emphasis', 'templates', function templates_ruler(state, silent) {   

    var start = state.pos;
    let prefix = state.src.slice(start, start + levels);
    if (prefix !== openString) return false;
    var indexOfClosingBrace = state.src.indexOf(closeString, start);

    if (indexOfClosingBrace > 0) {

      let match = contentRegex.exec(state.src.slice(start + levels, indexOfClosingBrace));
      if (!match) return false;

      let type = match[1];
      let template = templates.find(t => t.filter(type) && t);
      if (!template) return false;

      let args = match[2] ? match[2].trim().split(/\s*,+\s*/) : [];
      let token = state.push('template', '', 0);
      token.content = match[0];
      token.info = { type, template, args };
      if (template.parse) {
        token.content = template.parse(token, type, ...args) || token.content;
      }

      state.pos = indexOfClosingBrace + levels;
      return true;
    }

    return false;
  });

  md.renderer.rules.template = function(tokens, idx, options, env, renderer) {
    let token = tokens[idx];
    let template = token.info.template;
    if (template.render) {
      return template.render(token, token.info.type, ...token.info.args) || (openString + token.content + closeString);
    }
    return token.content;
  }

  let pathSegmentRegex = /(?:http[s]*:\/\/([^\/]*)|(?:\/([^\/?]*)))/g;
  md.renderer.rules.link_open = function(tokens, idx, options, env, renderer) {
    let token = tokens[idx];
    let attrs = token.attrs.reduce((str, attr) => {
      let name = attr[0];
      let value = attr[1];
      if (name === 'href') {
        let index = 0;
        value.replace(pathSegmentRegex, (m, domain, seg) => {
          str += `path-${index++}="${domain || seg}"`;
        });
      }
      return str += name + '="' + value + '" ';
    }, '');
    let anchor = `<a ${attrs}>`;
    return token.markup === 'linkify' ? anchor + '<span>' : anchor;
  }

  md.renderer.rules.link_close = function(tokens, idx, options, env, renderer) {
    return tokens[idx].markup === 'linkify' ? '</span></a>' : '</a>';
  }

};