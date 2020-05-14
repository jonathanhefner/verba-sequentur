const nock = require("nock")
const fs = require("fs").promises
const path = require("path")
const { Probot } = require("probot")
const appFn = require("..")
const payload = require("./fixtures/issues.labeled")

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

  test("creates a comment when an issue is labeled", async () => {
    const label = payload.label.name
    expect(label).toBeTruthy() // sanity check

    nock("https://api.github.com")
      .post("/repos/jonathanhefner/testing-things/issues/1/comments", ({ body }) => body == label)
      .reply(200)

    await probot.receive({ name: "issues", payload })
    expect(nock.isDone()).toBe(true)
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
