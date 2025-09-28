import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  MatchClosed,
  MatchCreated,
  PlayerJoined
} from "../generated/Competition/Competition"

export function createMatchClosedEvent(
  matchId: BigInt,
  winner: Address,
  reward: BigInt,
  platformFee: BigInt
): MatchClosed {
  let matchClosedEvent = changetype<MatchClosed>(newMockEvent())

  matchClosedEvent.parameters = new Array()

  matchClosedEvent.parameters.push(
    new ethereum.EventParam(
      "matchId",
      ethereum.Value.fromUnsignedBigInt(matchId)
    )
  )
  matchClosedEvent.parameters.push(
    new ethereum.EventParam("winner", ethereum.Value.fromAddress(winner))
  )
  matchClosedEvent.parameters.push(
    new ethereum.EventParam("reward", ethereum.Value.fromUnsignedBigInt(reward))
  )
  matchClosedEvent.parameters.push(
    new ethereum.EventParam(
      "platformFee",
      ethereum.Value.fromUnsignedBigInt(platformFee)
    )
  )

  return matchClosedEvent
}

export function createMatchCreatedEvent(
  matchId: BigInt,
  name: string,
  stake: BigInt,
  durationDays: BigInt
): MatchCreated {
  let matchCreatedEvent = changetype<MatchCreated>(newMockEvent())

  matchCreatedEvent.parameters = new Array()

  matchCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "matchId",
      ethereum.Value.fromUnsignedBigInt(matchId)
    )
  )
  matchCreatedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  matchCreatedEvent.parameters.push(
    new ethereum.EventParam("stake", ethereum.Value.fromUnsignedBigInt(stake))
  )
  matchCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "durationDays",
      ethereum.Value.fromUnsignedBigInt(durationDays)
    )
  )

  return matchCreatedEvent
}

export function createPlayerJoinedEvent(
  matchId: BigInt,
  player: Address
): PlayerJoined {
  let playerJoinedEvent = changetype<PlayerJoined>(newMockEvent())

  playerJoinedEvent.parameters = new Array()

  playerJoinedEvent.parameters.push(
    new ethereum.EventParam(
      "matchId",
      ethereum.Value.fromUnsignedBigInt(matchId)
    )
  )
  playerJoinedEvent.parameters.push(
    new ethereum.EventParam("player", ethereum.Value.fromAddress(player))
  )

  return playerJoinedEvent
}
