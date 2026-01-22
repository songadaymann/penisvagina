import type * as Party from "partykit/server";

// Game state types
type GameMode = "coop" | "compete";
type GamePhase = "lobby" | "playing" | "gameover";

interface Player {
  id: string;
  character: "penis" | "vagina";
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  facingRight: boolean;
  isWalking: boolean;
  score: number;
  lives: number;
  isInvincible: boolean;
}

interface Hat {
  id: string;
  type: "maga" | "ice";
  x: number;
  y: number;
  baseY: number;
  speed: number;
  scale: number;
  bobOffset: number;
  bobSpeed: number;
}

interface Pizza {
  id: string;
  type: "health" | "invincible";
  x: number;
  y: number;
  baseY: number;
  speed: number;
  bobOffset: number;
}

interface GameState {
  phase: GamePhase;
  mode: GameMode | null;
  players: Record<string, Player>;
  hats: Hat[];
  pizzas: Pizza[];
  hostId: string | null;
  roomCode: string;
  // Co-op specific
  sharedLives: number;
  combinedScore: number;
  // Compete specific
  timeRemaining: number;
  gameDuration: number;
}

// Message types from client
type ClientMessage =
  | { type: "join"; character?: "penis" | "vagina" }
  | { type: "setMode"; mode: GameMode }
  | { type: "startGame" }
  | { type: "playerUpdate"; x: number; y: number; velocityX: number; velocityY: number; facingRight: boolean; isWalking: boolean }
  | { type: "shoot"; x: number; y: number; velocityX: number; velocityY: number }
  | { type: "hatHit"; hatId: string; playerId: string }
  | { type: "playerHit"; playerId: string }
  | { type: "pizzaCollect"; pizzaId: string; playerId: string }
  | { type: "restartGame" };

// Message types to client
type ServerMessage =
  | { type: "roomState"; state: GameState; yourId: string }
  | { type: "playerJoined"; player: Player }
  | { type: "playerLeft"; playerId: string }
  | { type: "modeSet"; mode: GameMode }
  | { type: "gameStart"; state: GameState }
  | { type: "playerUpdate"; playerId: string; x: number; y: number; velocityX: number; velocityY: number; facingRight: boolean; isWalking: boolean }
  | { type: "playerShoot"; playerId: string; x: number; y: number; velocityX: number; velocityY: number }
  | { type: "hatSpawn"; hat: Hat }
  | { type: "hatDestroyed"; hatId: string; byPlayerId: string }
  | { type: "pizzaSpawn"; pizza: Pizza }
  | { type: "pizzaCollected"; pizzaId: string; byPlayerId: string; pizzaType: "health" | "invincible" }
  | { type: "playerDamaged"; playerId: string; livesRemaining: number; sharedLives?: number }
  | { type: "playerHealed"; playerId: string; livesRemaining: number; sharedLives?: number }
  | { type: "playerInvincible"; playerId: string; duration: number }
  | { type: "scoreUpdate"; playerId: string; score: number; combinedScore?: number }
  | { type: "timerUpdate"; timeRemaining: number }
  | { type: "gameOver"; winner?: string; finalScores: Record<string, number>; combinedScore?: number };

// Generate a simple 4-character room code
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid confusing chars like 0/O, 1/I
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Generate unique hat ID
function generateHatId(): string {
  return `hat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate unique pizza ID
function generatePizzaId(): string {
  return `pizza_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default class GameServer implements Party.Server {
  state: GameState;
  hatSpawnInterval: ReturnType<typeof setInterval> | null = null;
  pizzaSpawnInterval: ReturnType<typeof setInterval> | null = null;
  gameTimerInterval: ReturnType<typeof setInterval> | null = null;

  constructor(readonly room: Party.Room) {
    // Initialize empty game state
    this.state = {
      phase: "lobby",
      mode: null,
      players: {},
      hats: [],
      pizzas: [],
      hostId: null,
      roomCode: this.room.id.toUpperCase().slice(0, 4) || generateRoomCode(),
      sharedLives: 6,
      combinedScore: 0,
      timeRemaining: 90,
      gameDuration: 90,
    };
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(`Player connected: ${conn.id}`);

    // Send current room state to the new player
    const message: ServerMessage = {
      type: "roomState",
      state: this.state,
      yourId: conn.id,
    };
    conn.send(JSON.stringify(message));
  }

  onClose(conn: Party.Connection) {
    console.log(`Player disconnected: ${conn.id}`);

    // Remove player from state
    if (this.state.players[conn.id]) {
      delete this.state.players[conn.id];

      // Broadcast player left
      this.broadcast({
        type: "playerLeft",
        playerId: conn.id,
      });

      // If host left, assign new host
      if (this.state.hostId === conn.id) {
        const remainingPlayers = Object.keys(this.state.players);
        this.state.hostId = remainingPlayers.length > 0 ? remainingPlayers[0] : null;
      }

      // If no players left, reset game
      if (Object.keys(this.state.players).length === 0) {
        this.resetGame();
      }
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    const data = JSON.parse(message) as ClientMessage;

    switch (data.type) {
      case "join":
        this.handleJoin(sender, data.character);
        break;
      case "setMode":
        this.handleSetMode(data.mode, sender);
        break;
      case "startGame":
        this.handleStartGame(sender);
        break;
      case "playerUpdate":
        this.handlePlayerUpdate(data, sender);
        break;
      case "shoot":
        this.handleShoot(data, sender);
        break;
      case "hatHit":
        this.handleHatHit(data.hatId, data.playerId);
        break;
      case "playerHit":
        this.handlePlayerHit(data.playerId);
        break;
      case "pizzaCollect":
        this.handlePizzaCollect(data.pizzaId, data.playerId);
        break;
      case "restartGame":
        this.handleRestartGame(sender);
        break;
    }
  }

  handleJoin(conn: Party.Connection, chosenCharacter?: "penis" | "vagina") {
    // Use player's chosen character, or random if not specified
    const character: "penis" | "vagina" = chosenCharacter || (Math.random() < 0.5 ? "penis" : "vagina");

    const player: Player = {
      id: conn.id,
      character,
      x: 200,
      y: 300,
      velocityX: 0,
      velocityY: 0,
      facingRight: true,
      isWalking: false,
      score: 0,
      lives: 3,
      isInvincible: false,
    };

    this.state.players[conn.id] = player;

    // First player becomes host
    if (!this.state.hostId) {
      this.state.hostId = conn.id;
    }

    // Broadcast to all players
    this.broadcast({
      type: "playerJoined",
      player,
    });

    // Send updated room state to the joiner
    conn.send(JSON.stringify({
      type: "roomState",
      state: this.state,
      yourId: conn.id,
    }));
  }

  handleSetMode(mode: GameMode, sender: Party.Connection) {
    // Only host can set mode
    if (sender.id !== this.state.hostId) return;

    this.state.mode = mode;

    // Reset mode-specific state
    if (mode === "coop") {
      this.state.sharedLives = 6;
      this.state.combinedScore = 0;
    } else {
      this.state.timeRemaining = this.state.gameDuration;
      // Reset individual scores
      for (const player of Object.values(this.state.players)) {
        player.score = 0;
      }
    }

    this.broadcast({
      type: "modeSet",
      mode,
    });
  }

  handleStartGame(sender: Party.Connection) {
    // Only host can start, need 2 players, and mode must be set
    if (sender.id !== this.state.hostId) return;
    if (Object.keys(this.state.players).length < 2) return;
    if (!this.state.mode) return;

    this.state.phase = "playing";
    this.state.hats = [];
    this.state.pizzas = [];

    // Reset player positions
    const playerIds = Object.keys(this.state.players);
    playerIds.forEach((id, index) => {
      this.state.players[id].x = 200 + index * 150;
      this.state.players[id].y = 300;
      this.state.players[id].score = 0;
      this.state.players[id].lives = 3;
    });

    this.broadcast({
      type: "gameStart",
      state: this.state,
    });

    // Start spawning hats and pizzas
    this.startHatSpawning();
    this.startPizzaSpawning();

    // Start timer for compete mode
    if (this.state.mode === "compete") {
      this.startGameTimer();
    }
  }

  handlePlayerUpdate(data: ClientMessage & { type: "playerUpdate" }, sender: Party.Connection) {
    if (!this.state.players[sender.id]) return;

    // Update player state
    this.state.players[sender.id].x = data.x;
    this.state.players[sender.id].y = data.y;
    this.state.players[sender.id].velocityX = data.velocityX;
    this.state.players[sender.id].velocityY = data.velocityY;
    this.state.players[sender.id].facingRight = data.facingRight;
    this.state.players[sender.id].isWalking = data.isWalking;

    // Broadcast to other players
    this.broadcastExcept(sender.id, {
      type: "playerUpdate",
      playerId: sender.id,
      x: data.x,
      y: data.y,
      velocityX: data.velocityX,
      velocityY: data.velocityY,
      facingRight: data.facingRight,
      isWalking: data.isWalking,
    });
  }

  handleShoot(data: ClientMessage & { type: "shoot" }, sender: Party.Connection) {
    // Broadcast shot to all other players
    this.broadcastExcept(sender.id, {
      type: "playerShoot",
      playerId: sender.id,
      x: data.x,
      y: data.y,
      velocityX: data.velocityX,
      velocityY: data.velocityY,
    });
  }

  handleHatHit(hatId: string, playerId: string) {
    // Find and remove the hat
    const hatIndex = this.state.hats.findIndex(h => h.id === hatId);
    if (hatIndex === -1) return; // Already destroyed

    this.state.hats.splice(hatIndex, 1);

    // Update score
    if (this.state.players[playerId]) {
      this.state.players[playerId].score++;

      if (this.state.mode === "coop") {
        this.state.combinedScore++;
      }
    }

    // Broadcast hat destruction and score update
    this.broadcast({
      type: "hatDestroyed",
      hatId,
      byPlayerId: playerId,
    });

    this.broadcast({
      type: "scoreUpdate",
      playerId,
      score: this.state.players[playerId]?.score || 0,
      combinedScore: this.state.combinedScore,
    });
  }

  handlePlayerHit(playerId: string) {
    if (!this.state.players[playerId]) return;

    const player = this.state.players[playerId];
    if (player.isInvincible) return;

    player.isInvincible = true;

    if (this.state.mode === "coop") {
      this.state.sharedLives--;

      this.broadcast({
        type: "playerDamaged",
        playerId,
        livesRemaining: player.lives,
        sharedLives: this.state.sharedLives,
      });

      // Check game over
      if (this.state.sharedLives <= 0) {
        this.endGame();
      }
    } else {
      player.lives--;

      this.broadcast({
        type: "playerDamaged",
        playerId,
        livesRemaining: player.lives,
      });
    }

    // Reset invincibility after delay (handled client-side, but track here too)
    setTimeout(() => {
      if (this.state.players[playerId]) {
        this.state.players[playerId].isInvincible = false;
      }
    }, 1500);
  }

  handlePizzaCollect(pizzaId: string, playerId: string) {
    // Find and remove the pizza
    const pizzaIndex = this.state.pizzas.findIndex(p => p.id === pizzaId);
    if (pizzaIndex === -1) return; // Already collected

    const pizza = this.state.pizzas[pizzaIndex];
    this.state.pizzas.splice(pizzaIndex, 1);

    // Handle the power-up effect
    if (pizza.type === "health") {
      // Restore a life
      if (this.state.mode === "coop") {
        this.state.sharedLives = Math.min(6, this.state.sharedLives + 1);
        this.broadcast({
          type: "playerHealed",
          playerId,
          livesRemaining: this.state.players[playerId]?.lives || 3,
          sharedLives: this.state.sharedLives,
        });
      } else if (this.state.players[playerId]) {
        this.state.players[playerId].lives = Math.min(3, this.state.players[playerId].lives + 1);
        this.broadcast({
          type: "playerHealed",
          playerId,
          livesRemaining: this.state.players[playerId].lives,
        });
      }
    } else if (pizza.type === "invincible") {
      // Grant invincibility
      if (this.state.players[playerId]) {
        this.state.players[playerId].isInvincible = true;
        this.broadcast({
          type: "playerInvincible",
          playerId,
          duration: 10000, // 10 seconds
        });
        // Reset invincibility after duration
        setTimeout(() => {
          if (this.state.players[playerId]) {
            this.state.players[playerId].isInvincible = false;
          }
        }, 10000);
      }
    }

    // Broadcast pizza collection to all
    this.broadcast({
      type: "pizzaCollected",
      pizzaId,
      byPlayerId: playerId,
      pizzaType: pizza.type,
    });
  }

  handleRestartGame(sender: Party.Connection) {
    if (sender.id !== this.state.hostId) return;

    // Reset to lobby
    this.stopHatSpawning();
    this.stopPizzaSpawning();
    this.stopGameTimer();

    this.state.phase = "lobby";
    this.state.hats = [];
    this.state.pizzas = [];
    this.state.sharedLives = 6;
    this.state.combinedScore = 0;
    this.state.timeRemaining = this.state.gameDuration;

    for (const player of Object.values(this.state.players)) {
      player.score = 0;
      player.lives = 3;
      player.x = 200;
      player.y = 300;
    }

    this.broadcast({
      type: "roomState",
      state: this.state,
      yourId: "", // Will be overwritten per-connection
    });
  }

  startHatSpawning() {
    // Spawn a hat every 2-3 seconds
    const spawnHat = () => {
      if (this.state.phase !== "playing") return;

      const hat: Hat = {
        id: generateHatId(),
        type: Math.random() < 0.5 ? "maga" : "ice",
        x: 2000, // Will be adjusted client-side based on camera
        y: 100 + Math.random() * 300,
        baseY: 100 + Math.random() * 300,
        speed: 100 + Math.random() * 150,
        scale: 0.15 + Math.random() * 0.1,
        bobOffset: Math.random() * Math.PI * 2,
        bobSpeed: 2 + Math.random() * 2,
      };

      this.state.hats.push(hat);

      this.broadcast({
        type: "hatSpawn",
        hat,
      });
    };

    // Initial spawn
    spawnHat();

    // Continue spawning
    this.hatSpawnInterval = setInterval(() => {
      spawnHat();
    }, 2000 + Math.random() * 1000);
  }

  stopHatSpawning() {
    if (this.hatSpawnInterval) {
      clearInterval(this.hatSpawnInterval);
      this.hatSpawnInterval = null;
    }
  }

  startPizzaSpawning() {
    // Spawn a pizza every 15 seconds
    const spawnPizza = () => {
      if (this.state.phase !== "playing") return;

      const pizza: Pizza = {
        id: generatePizzaId(),
        type: Math.random() < 0.5 ? "health" : "invincible",
        x: 2000, // Will be adjusted client-side based on camera
        y: 150 + Math.random() * 250,
        baseY: 150 + Math.random() * 250,
        speed: 80 + Math.random() * 40,
        bobOffset: Math.random() * Math.PI * 2,
      };

      this.state.pizzas.push(pizza);

      this.broadcast({
        type: "pizzaSpawn",
        pizza,
      });
    };

    // Continue spawning every 15 seconds
    this.pizzaSpawnInterval = setInterval(() => {
      spawnPizza();
    }, 15000);
  }

  stopPizzaSpawning() {
    if (this.pizzaSpawnInterval) {
      clearInterval(this.pizzaSpawnInterval);
      this.pizzaSpawnInterval = null;
    }
  }

  startGameTimer() {
    this.state.timeRemaining = this.state.gameDuration;

    this.gameTimerInterval = setInterval(() => {
      this.state.timeRemaining--;

      this.broadcast({
        type: "timerUpdate",
        timeRemaining: this.state.timeRemaining,
      });

      if (this.state.timeRemaining <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  stopGameTimer() {
    if (this.gameTimerInterval) {
      clearInterval(this.gameTimerInterval);
      this.gameTimerInterval = null;
    }
  }

  endGame() {
    this.state.phase = "gameover";
    this.stopHatSpawning();
    this.stopPizzaSpawning();
    this.stopGameTimer();

    // Determine winner for compete mode
    let winner: string | undefined;
    const finalScores: Record<string, number> = {};

    for (const [id, player] of Object.entries(this.state.players)) {
      finalScores[id] = player.score;
    }

    if (this.state.mode === "compete") {
      const sortedPlayers = Object.entries(this.state.players)
        .sort((a, b) => b[1].score - a[1].score);

      if (sortedPlayers.length > 0 && sortedPlayers[0][1].score > (sortedPlayers[1]?.[1].score || 0)) {
        winner = sortedPlayers[0][0];
      }
    }

    this.broadcast({
      type: "gameOver",
      winner,
      finalScores,
      combinedScore: this.state.combinedScore,
    });
  }

  resetGame() {
    this.stopHatSpawning();
    this.stopPizzaSpawning();
    this.stopGameTimer();

    this.state = {
      phase: "lobby",
      mode: null,
      players: {},
      hats: [],
      pizzas: [],
      hostId: null,
      roomCode: this.state.roomCode,
      sharedLives: 6,
      combinedScore: 0,
      timeRemaining: 90,
      gameDuration: 90,
    };
  }

  broadcast(message: ServerMessage) {
    const msg = JSON.stringify(message);
    for (const conn of this.room.getConnections()) {
      conn.send(msg);
    }
  }

  broadcastExcept(excludeId: string, message: ServerMessage) {
    const msg = JSON.stringify(message);
    for (const conn of this.room.getConnections()) {
      if (conn.id !== excludeId) {
        conn.send(msg);
      }
    }
  }
}
