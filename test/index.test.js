const nock = require("nock")
const fs = require("fs").promises
const path = require("path")
const yaml = require("js-yaml")
const { Probot } = require("probot")
const appFn = require("..")
const webhookEvents = require("./fixtures/webhook-events.json")
const repoUrlPath = "/repos/jonathanhefner/testing-things"

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
      .get(`${repoUrlPath}/contents/.github/verba-sequentur.yml`)
      .reply(200, { content: Buffer.from(configYaml).toString("base64") })

    probot = new Probot({ id: 123, cert: mockCert })
    probot.load(appFn)
  })

  test.each([
    "issue labeled foo",
    "pull request labeled foo",
    "issue labeled bar",
    "pull request labeled bar"
  ])("handles %s", async (scenario) => {
    const event = webhookEvents[scenario]
    const label = event.payload.label.name
    const comment = config[label].comment

    nock("https://api.github.com")
      .post(`${repoUrlPath}/issues/1/comments`, ({ body }) => body == comment)
      .reply(200)

    await probot.receive(event)
    expect(nock.isDone()).toBe(true)
  })

  test.each([
    "issue labeled zzz",
    "pull request labeled zzz"
  ])("ignores %s", async (scenario) => {
    const event = webhookEvents[scenario]
    await probot.receive(event)
    expect(nock.isDone()).toBe(true)
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
