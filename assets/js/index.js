
(function(){

var markdown = window.markdownit();

/* Sidebar Interactions */

delegateEvent('pointerup', '[panel-toggle]', (e, delegate) => {
  slidepanels.toggle(delegate.getAttribute('panel-toggle'));
}, { passive: true });

window.addEventListener('hashchange', (e) => slidepanels.close());

/* GitHub Issues */

 let source = specConfig.source;
  if (source) {
    if (source.host === 'github') {
      fetch(`https://api.github.com/repos/${ source.account + '/' + source.repo }/issues`)
        .then(response => response.json())
        .then(issues => {
          let count = issues.length;
          document.querySelectorAll('[issue-count]').forEach(node => {
            node.setAttribute('issue-count', count)
          });
          repo_issue_list.innerHTML = issues.map(issue => {
            return `<li class="repo-issue">
              <detail-box>
                <section>${markdown.render(issue.body)}</section>
                <header class="repo-issue-title">
                  <span class="repo-issue-number">${issue.number}</span>
                  <span class="repo-issue-link">
                    <a href="${issue.html_url}" target="_blank">${issue.title}</a>
                  </span>
                  <span detail-box-toggle></span>
                </header>
              </detail-box>
            </li>`
          }).join('');
          Prism.highlightAllUnder(repo_issue_list);
        })
    }
  }
  //${markdown.render(issue.body)}

/* Mermaid Diagrams */

mermaid.initialize({
  startOnLoad: true,
  theme: 'neutral'
});

/* Charts */

document.querySelectorAll('.chartjs').forEach(chart => {
  new Chart(chart, JSON.parse(chart.textContent));
});

/* Tooltips */
let tipMap = new WeakMap();
delegateEvent('pointerover', '.term-reference, .spec-reference', (e, anchor) => {
  let term = document.getElementById((anchor.getAttribute('href') || '').replace('#', ''));
  if (!term || tipMap.has(anchor)) return;
  let container = term.closest('dt, td:first-child');
  if (!container) return;
  let tip = {
    allowHTML: true,
    inlinePositioning: true
  } 
  switch (container.tagName) {
    case 'DT':
      tip.content = container.nextElementSibling.textContent;
      break;
    case 'TD':
      let table = container.closest('table');
      let tds = Array.from(container.closest('tr').children);
          tds.shift();
      if (table) {
        let headings = Array.from(table.querySelectorAll('thead th'));
            headings.shift();
        if (headings.length) {
          tip.content = `
            <header>${container.textContent}</header>
            <table>
              ${headings.map((th, i) => {
                return `<tr><td>${th.textContent}:</td><td>${tds[i] ? tds[i].textContent : ''}</td></tr>`
              }).join('')}
            </table>`;
        }
      }
      break;
  }
  if (tip.content) tipMap.set(anchor, tippy(anchor, tip));
}, { passive: true });


})();
