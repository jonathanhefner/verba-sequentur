const nock = require("nock")
const fs = require("fs").promises
const path = require("path")
const { Probot } = require("probot")
const appFn = require("..")
const webhookEvents = require("./fixtures/webhook-events.json")

describe("verba-sequentur", () => {
  let probot
  let mockCert

  beforeAll(async () => {
    mockCert = await fs.readFile(path.join(__dirname, "fixtures/mock-cert.pem"))
  })

  beforeEach(() => {
    nock.disableNetConnect()
    probot = new Probot({ id: 123, cert: mockCert })
    probot.load(appFn)
  })

  test.each([
    "issue labeled foo",
    "pull request labeled foo"
  ])("handles %s", async (scenario) => {
    const event = webhookEvents[scenario]
    const label = event.payload.label.name
    expect(label).toBeTruthy() // sanity check

    nock("https://api.github.com")
      .post("/repos/jonathanhefner/testing-things/issues/1/comments", ({ body }) => body == label)
      .reply(200)

    await probot.receive(event)
    expect(nock.isDone()).toBe(true)
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
