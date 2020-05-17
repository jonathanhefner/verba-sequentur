# verba-sequentur

A label-triggered canned response bot for GitHub issues.  Features:

* `comment` setting per label
* `close` setting per label
* Does not trigger for already closed / locked issues
* Does not trigger when a label is removed and re-applied


## Usage

Install the [Verba Sequentur GitHub App](https://github.com/apps/verba-sequentur)
for your repository, or deploy your own instance of the verba-sequentur
bot using the [Deploying](#deploying) instructions.

Then create a `.github/verba-sequentur.yml` configuration file in your
repository, using the format shown in the example below.  Each top-level
key is a label, and each label may have a `comment` and `close` setting.

### Example configuration

```yaml
"support request":
  comment: >
    This appears to be a request for technical support.  We reserve this
    issue tracker for bugs.  Please use Stack Overflow for technical
    support questions, where a wider community can help you.
  close: true

"needs reproduction":
  comment: >
    There doesn't appear to be enough information here to debug this
    issue.  Please provide a minimal reproduction script using this
    [template](https://github.com/...).

"spam":
  close: true
```


## Deploying

If you want to run your own instance of verba-sequentur, follow the
Probot [deployment guide](https://probot.github.io/docs/deployment/).
When creating your GitHub App, you can either create it manually as the
guide describes, or you can use the Probot setup wizard with this
repository:

```bash
$ git clone https://github.com/jonathanhefner/verba-sequentur
$ cd verba-sequentur

# Starting the bot without an APP_ID activates the setup wizard
$ npm install && npm start

# Now visit http://localhost:3000 to step through the wizard
```

Please ensure that your GitHub App requests the appropriate permissions:

* Issues: Read & write
* Pull requests: Read & write
* Single file: Read-only
  * Path: `.github/verba-sequentur.yml`

And subscribes to the appropriate events:

* Issues
* Pull request


## Contributing

Run `npm test` to run the tests.


## License

[ISC License](LICENSE)
