/* eslint-disable unicorn/no-process-exit */
// .husky/gitmoji.js
import {appendFileSync, existsSync, readFileSync, writeFileSync} from 'node:fs';
import process from 'node:process';

// Emoji mapping for conventional commit types
const emojiMap = {
  feat: '✨',
  fix: '🐛',
  docs: '📚',
  style: '💄',
  refactor: '♻️',
  perf: '⚡️',
  test: '✅',
  build: '🔧',
  ci: '👷',
  chore: '🔨',
  init: '🎉',
  wip: '🚧',
  hotfix: '🚑️',
  breaking: '💥',
  remove: '🔥',
  move: '🚚',
  config: '🔧',
  deps: '⬆️',
  security: '🔒',
  revert: '⏪️',
  merge: '🔀',
  release: '🔖',
};

const messageFile = process.argv[2];

// Enhanced debugging
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  // Log to file for debugging
  try {
    appendFileSync('/tmp/gitmoji.log', logMessage);
  } catch {
    // Ignore file write errors
  }

  // Also log to console
  console.log(message);
}

log(`Gitmoji script started with args: ${process.argv.slice(2).join(' ')}`);

if (!messageFile) {
  log('ERROR: No message file provided');
  process.exit(1);
}

if (!existsSync(messageFile)) {
  log(`ERROR: Message file does not exist: ${messageFile}`);
  process.exit(1);
}

try {
  const message = readFileSync(messageFile, 'utf8').trim();
  log(`Original message: "${message}"`);

  if (!message) {
    log('Empty message, exiting');
    process.exit(0);
  }

  // Check if already has emoji at the start
  if (
    /^[\u{1F000}-\u{1F6FF}\u{2600}-\u{26FF}\u{1F900}-\u{1F9FF}]/u.test(message)
  ) {
    log('Message already has emoji, skipping');
    process.exit(0);
  }

  // Parse conventional commit format - more flexible regex
  const match = message.match(/^(\w+)(?:\([^)]*\))?\s*!?\s*:\s*(.+)/s);

  if (match) {
    const type = match[1].toLowerCase();
    const emoji = emojiMap[type];
    log(`Detected commit type: "${type}"`);

    if (emoji) {
      const newMessage = `${emoji} ${message}`;
      writeFileSync(messageFile, newMessage);
      log(`Successfully added ${emoji} emoji. New message: "${newMessage}"`);
    } else {
      log(`No emoji mapping found for type: "${type}"`);
    }
  } else {
    log('Message does not match conventional commit format');
  }
} catch (error) {
  log(`ERROR in gitmoji hook: ${error.message}`);
  log(`Stack trace: ${error.stack}`);
}
