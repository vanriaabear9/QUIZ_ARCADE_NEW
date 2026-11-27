// Remembers which class lobby the student last opened, so "Back to arcade" on the
// results screen returns to that class instead of the landing page.
let lobbyClassId: number | null = null;

export function setLobbyClass(id: number) {
  lobbyClassId = id;
}

export function getLobbyClass() {
  return lobbyClassId;
}
