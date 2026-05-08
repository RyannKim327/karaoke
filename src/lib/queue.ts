import fs from 'fs/promises';
import path from 'path';

const SESSIONS_DIR = './sessions';

// -------------------------
// Init folder
// -------------------------

await fs.mkdir(SESSIONS_DIR, { recursive: true });

// -------------------------
// Helpers
// -------------------------

function generateRoomID(length = 8) {
	const chars =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	let id = '';

	for (let i = 0; i < length; i++) {
		id += chars[Math.floor(Math.random() * chars.length)];
	}

	return id;
}

function getSessionPath(roomID) {
	return path.join(SESSIONS_DIR, `${roomID}.json`);
}

async function roomExists(roomID) {
	try {
		await fs.access(getSessionPath(roomID));
		return true;
	} catch {
		return false;
	}
}

// -------------------------
// Create Session
// -------------------------

export async function createSessionRoom(password = '') {
	let roomID;

	do {
		roomID = generateRoomID(8);
	} while (await roomExists(roomID));

	const session = {
		password,
		songs: [],
		emptySince: Date.now()
	};

	await fs.writeFile(
		getSessionPath(roomID),
		JSON.stringify(session, null, 2)
	);

	return roomID;
}

// -------------------------
// Get Session
// -------------------------

export async function getSession(roomID) {
	try {
		const data = await fs.readFile(getSessionPath(roomID), 'utf8');
		return JSON.parse(data);
	} catch {
		return null;
	}
}

// -------------------------
// Save Session
// -------------------------

export async function saveSession(roomID, data) {
	await fs.writeFile(
		getSessionPath(roomID),
		JSON.stringify(data, null, 2)
	);
}

// -------------------------
// Add Song
// -------------------------

export async function addSong(roomID, song) {
	const session = await getSession(roomID);

	if (!session) {
		throw new Error('Room does not exist');
	}

	session.songs.push(song);
	session.emptySince = null;

	await saveSession(roomID, session);

	return session;
}

// -------------------------
// Shift Song
// -------------------------

export async function playNextSong(roomID) {
	const session = await getSession(roomID);

	if (!session) {
		throw new Error('Room does not exist');
	}

	const playedSong = session.songs.shift();

	// if empty start timer
	if (session.songs.length === 0) {
		session.emptySince = Date.now();
	}

	await saveSession(roomID, session);

	return playedSong;
}

// -------------------------
// Delete Session
// -------------------------

export async function deleteSession(roomID) {
	try {
		await fs.unlink(getSessionPath(roomID));
	} catch { }
}

// -------------------------
// Cleanup Expired Sessions
// Deletes after 1 minute empty
// -------------------------

export async function cleanupExpiredSessions() {
	const files = await fs.readdir(SESSIONS_DIR);

	const now = Date.now();

	for (const file of files) {
		if (!file.endsWith('.json')) continue;

		const roomID = file.replace('.json', '');

		const session = await getSession(roomID);

		if (!session) continue;

		if (
			session.songs.length === 0 &&
			session.emptySince &&
			now - session.emptySince >= 60_000
		) {
			await deleteSession(roomID);

			console.log(`Deleted expired session: ${roomID}`);
		}
	}
}

// auto cleanup every 30 sec
setInterval(() => {
	cleanupExpiredSessions().catch(console.error);
}, 30_000);
