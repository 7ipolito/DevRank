import {
  MatchClosed as MatchClosedEvent,
  MatchCreated as MatchCreatedEvent,
  PlayerJoined as PlayerJoinedEvent
} from "../generated/Competition/Competition"
import { MatchClosed, MatchCreated, PlayerJoined } from "../generated/schema"

export function handleMatchClosed(event: MatchClosedEvent): void {
  let entity = new MatchClosed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.matchId = event.params.matchId
  entity.winner = event.params.winner
  entity.reward = event.params.reward
  entity.platformFee = event.params.platformFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMatchCreated(event: MatchCreatedEvent): void {
  let entity = new MatchCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.matchId = event.params.matchId
  entity.name = event.params.name
  entity.stake = event.params.stake
  entity.durationDays = event.params.durationDays

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePlayerJoined(event: PlayerJoinedEvent): void {
  let entity = new PlayerJoined(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.matchId = event.params.matchId
  entity.player = event.params.player

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
