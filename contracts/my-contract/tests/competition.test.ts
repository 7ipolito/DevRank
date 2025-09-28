import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { MatchClosed } from "../generated/schema"
import { MatchClosed as MatchClosedEvent } from "../generated/Competition/Competition"
import { handleMatchClosed } from "../src/competition"
import { createMatchClosedEvent } from "./competition-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let matchId = BigInt.fromI32(234)
    let winner = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let reward = BigInt.fromI32(234)
    let platformFee = BigInt.fromI32(234)
    let newMatchClosedEvent = createMatchClosedEvent(
      matchId,
      winner,
      reward,
      platformFee
    )
    handleMatchClosed(newMatchClosedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("MatchClosed created and stored", () => {
    assert.entityCount("MatchClosed", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "MatchClosed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "matchId",
      "234"
    )
    assert.fieldEquals(
      "MatchClosed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "winner",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MatchClosed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "reward",
      "234"
    )
    assert.fieldEquals(
      "MatchClosed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "platformFee",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
