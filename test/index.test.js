const nock = require("nock")
const fs = require("fs").promises
const path = require("path")
const yaml = require("js-yaml")
const { Probot } = require("probot")
const appFn = require("..")
const webhookEvents = require("./fixtures/webhook-events.json")
const issueHistory = require("./fixtures/issue-history.json")
const repoUrlPath = "/repos/jonathanhefner/testing-things"
const issueUrlPath = `${repoUrlPath}/issues/1`

describe("verba-sequentur", () => {
  let probot
  let mockCert
  let config
  let configYaml

  beforeAll(async () => {
    mockCert = await fs.readFile(path.join(__dirname, "fixtures/mock-cert.pem"))
    configYaml = await fs.readFile(path.join(__dirname, "fixtures/config.yml"))
    config = yaml.safeLoad(configYaml)
  })

  beforeEach(() => {
    nock.disableNetConnect()

    nock("https://api.github.com")
      .get(`${issueUrlPath}/events`)
      .reply(200, issueHistory[0], { "Link": `<${issueUrlPath}/events/2>; rel="next"` })
      .get(`${issueUrlPath}/events/2`)
      .reply(200, issueHistory[1])
      .get(`${repoUrlPath}/contents/.github/verba-sequentur.yml`)
      .optionally().reply(200, { content: Buffer.from(configYaml).toString("base64") })

    probot = new Probot({ id: 123, cert: mockCert })
    probot.load(appFn)
  })

  test.each([
    "issue labeled foo",
    "pull request labeled foo",
    "issue labeled bar",
    "pull request labeled bar",
    "issue labeled baz",
    "pull request labeled baz"
  ])("handles %s", async (scenario) => {
    const event = webhookEvents[scenario]
    const label = event.payload.label.name
    const comment = config[label].comment
    const close = config[label].close

    nock("https://api.github.com")
      .post(`${issueUrlPath}/comments`, ({ body }) => body == comment)
      .optionally(!comment).reply(200)
      .patch(issueUrlPath, ({ state }) => state == "closed")
      .optionally(!close).reply(200)

    await probot.receive(event)
    expect(nock.isDone()).toBe(true)
  })

  test.each([
    "issue re-labeled qux",
    "pull request re-labeled qux",
    "issue labeled zzz",
    "pull request labeled zzz"
  ])("ignores %s", async (scenario) => {
    const event = webhookEvents[scenario]
    await probot.receive(event)
    expect(nock.isDone()).toBe(true)
  })

  test.each([
    "closed issue labeled foo",
    "closed pull request labeled foo",
    "locked issue labeled foo",
    "locked pull request labeled foo"
  ])("ignores %s", async (scenario) => {
    nock.cleanAll() // should not fetch anything else
    const event = webhookEvents[scenario]
    await probot.receive(event)
    expect(nock.isDone()).toBe(true)
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
