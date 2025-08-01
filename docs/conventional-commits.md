# Conventional Commits Guidelines

This project follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification to make commit messages more readable and automatable.

## Commit Message Format

A commit message consists of a **header**, a **body**, and a **footer**. The header is mandatory and follows this format:

```txt
<type>(<scope>): <description>
```

### Type

Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests or correcting existing tests
* **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
* **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
* **chore**: Other changes that don't modify src or test files
* **revert**: Reverts a previous commit

### Scope (Optional)

The scope should be the name of the module, file, or section affected by the change (e.g., `compiler`, `login`, `navbar`). It is optional.

### Description

A short, concise description of the change. It should:

* Use the imperative, present tense: "change" not "changed" nor "changes"
* Not capitalize the first letter
* Not end with a period

### Body (Optional)

The body should include the motivation for the change and contrast this with previous behavior. It should wrap at 72 characters.

### Footer (Optional)

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

### Gitmoji

To add more context and visual cues, we also use [Gitmoji](https://gitmoji.dev/). The Gitmoji should be placed at the very beginning of the commit message header, right after the `<type>(<scope>):`.

Example:

```txt
feat(api): :rocket: Add new user authentication endpoint
fix(ui): :bug: Correct button alignment on mobile view
docs(readme): :pencil: Update installation instructions
```

## Examples

* `feat(api): :sparkles: add 'graphiteWidth' option`
* `fix(compiler): :bug: stop graphite breaking when width < 0.1`
* `docs(readme): :pencil: update quickstart guide`
* `style: :art: format code according to project guidelines`
* `refactor: :recycle: rename 'getUser' to 'fetchUser'`
* `test: :white_check_mark: add missing unit tests for user service`
* `chore(release): :tada: prepare v1.0.0 release`
