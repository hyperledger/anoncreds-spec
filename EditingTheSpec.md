# Editing the Specification

To contribute changes to the specification, please 

- Review the [Contributions policy](6._Contributing.md) for this specification and ensure that you and your organization are willing to abide by the policy.
  - **Pull requests submitted to this repository imply acceptance of the [Contributions policy](6._Contributing.md).**
- Submit a pull request by:
  - forking this repo
  - editing the appropriate markdown files in the [`/spec`](/spec) folder

The specification source consists of the markdown files listed in
[specs.json](/specs.json) and found in the [`/spec`](/spec) folder. The
specification is automatically rendered (using
 [Spec-Up](https://github.com/decentralized-identity/spec-up)) to the `/docs`
 folder of the `gh-pages` branch of this repository on each pull request merge
 (using a GitHub Action), and then published (using GitHub Pages).

## Testing your Edits Locally

Full guidance for using Spec-Up is in its
[repository](https://github.com/decentralized-identity/spec-up). The short
version of the instructions to render this specification locally while you are
editing is:

- Install the prerequisites: `node` and `npm`
- Run `npm install` from the root of the repository
- Run `npm run edit` from the root of the repository to render the document with
  live updates to the `docs/index.html` as
  you edit the source files.
  - You can also run `npm run render` to just generate the specification file once.
- Open the rendered file in a browser and refresh to see your updates as you work.
- When you are done, hit `Ctrl-c` to exit the live rendering.

Please check your edits locally before you submit a pull request!

### Handling the Rendered Specification File

When you create a pull request to update the specification, the `docs/index.html` will be
.gitignore'd and **not** included in your pull request. A GitHub Action triggered on merging pull requests automagically renders the full
specification (`docs/index.html`) to the `gh-pages` branch in the repository and the
specification is published (via GitHub Pages) from there.

## Adding a New Source Markdown File

If you add a source markdown file to the specification, you must also add a reference
to it in the [specs.json](/specs.json) in the root of the repository.
