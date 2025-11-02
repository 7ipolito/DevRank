import {
  MatchClosed as MatchClosedEvent,
  MatchCreated as MatchCreatedEvent,
  PlayerJoined as PlayerJoinedEvent
} from "../generated/smartcontract-competitions/smartcontract_competitions"
import { 
  MatchClosed, 
  MatchCreated, 
  PlayerJoined,
  Match,
  Participation,
  Player
} from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"

export function handleMatchClosed(event: MatchClosedEvent): void {
  let matchId = event.params.matchId.toString()
  
  // Atualizar Match para marcar como inativo
  let match = Match.load(matchId)
  if (match != null) {
    match.active = false
    match.save()
  }

  // Criar evento imutável MatchClosed
  let entity = new MatchClosed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.match = matchId
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
  // Criar a entidade Match (estado atual)
  let matchId = event.params.matchId.toString()
  let match = new Match(matchId)
  match.matchId = event.params.matchId
  match.name = event.params.name
  match.durationDays = event.params.durationDays
  match.stake = BigInt.fromI32(0)
  
  // Use startTime from event if available (new contract), otherwise use block.timestamp (old contract)
  match.startTime = event.block.timestamp
  
  match.active = true
  match.participantCount = BigInt.fromI32(0)
  match.createdAt = event.block.timestamp
  match.createdTxHash = event.transaction.hash
  match.save()

  // Criar evento imutável MatchCreated
  let entity = new MatchCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.match = matchId
  entity.matchId = event.params.matchId
  entity.name = event.params.name
  entity.durationDays = event.params.durationDays
  
  // Set startTime to block.timestamp for backwards compatibility
  entity.startTime = event.block.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handlePlayerJoined(event: PlayerJoinedEvent): void {
  let matchId = event.params.matchId.toString()
  let playerAddress = event.params.player
  
  // Usar o stakeAmount do evento (pode ser 0 para eventos antigos)
  let stakeAmount = event.params.stakeAmount

  // Atualizar ou criar Player
  let player = Player.load(playerAddress)
  if (player == null) {
    player = new Player(playerAddress)
    player.matchesJoined = BigInt.fromI32(0)
  }
  player.matchesJoined = player.matchesJoined.plus(BigInt.fromI32(1))
  player.save()

  // Criar Participation (matchId-playerAddress)
  // Usar toHexString() que retorna com prefixo 0x - precisa normalizar para lowercase
  let addressHex = playerAddress.toHexString().toLowerCase()
  let participationId = matchId + "-" + addressHex
  let participation = new Participation(participationId)
  participation.match = matchId
  participation.player = playerAddress
  participation.joinedAt = event.block.timestamp
  participation.joinedTxHash = event.transaction.hash
  participation.save()

  // Atualizar Match
  let match = Match.load(matchId)
  if (match != null) {
    match.participantCount = match.participantCount.plus(BigInt.fromI32(1))
    match.stake = match.stake.plus(stakeAmount)
    match.save()
  }

  // Criar evento imutável PlayerJoined
  let entity = new PlayerJoined(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.match = matchId
  entity.participation = participationId
  entity.matchId = event.params.matchId
  entity.player = event.params.player
  
  // Usar o stakeAmount real do evento
  entity.stakeAmount = stakeAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}
