// Run: node --import tsx script/assert-ai-chat.ts
// Pure message checks only: no network, API client, or API key.
import assert from "node:assert/strict";
import type { BetaMessageParam } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { buildMessages } from "../server/ai-chat";

const question = { role: "user", content: "식물을 추천해 주세요" } satisfies BetaMessageParam;
const answer = { role: "assistant", content: "햇빛은 얼마나 드나요?" } satisfies BetaMessageParam;

assert.deepEqual(buildMessages(question.content, [
  { role: "assistant", content: "안녕하세요" },
  { role: "assistant", content: "심다입니다" },
  question,
]), [question], "remove every leading assistant greeting");

const history = [question, answer, { role: "user", content: "오전에 들어요" }] satisfies BetaMessageParam[];
const original = structuredClone(history);
assert.deepEqual(buildMessages("오전에 들어요", history), history, "do not duplicate the last user message");
assert.deepEqual(history, original, "do not mutate history");
assert.deepEqual(buildMessages(question.content, [question, answer]), [question, answer, question], "append after an assistant even if the question appeared earlier");
assert.deepEqual(buildMessages("다른 질문", [question]), [question, { role: "user", content: "다른 질문" }], "append a different final user message");

assert.deepEqual(buildMessages(question.content, [
  { role: "user", content: " \n\t " },
  { role: "assistant", content: "첫 인사" },
  { role: "assistant", content: "" },
  question,
  { role: "user", content: "  " },
]), [question], "drop blank messages before greeting removal and deduplication");
assert.deepEqual(buildMessages("  ", []), [], "never append a blank current message");
assert.deepEqual(buildMessages("  질문  ", []), [{ role: "user", content: "  질문  " }], "preserve nonblank content verbatim");

const longHistory: BetaMessageParam[] = Array.from({ length: 60 }, (_, index) => ({
  role: index % 2 === 0 ? "user" : "assistant",
  content: `message-${index}`,
}));
const recent = buildMessages("마지막 질문", longHistory);
assert.equal(recent.length, 39, "discard the assistant exposed by the 40-message cutoff");
assert.equal(recent[0].role, "user");
assert.equal(recent[0].content, "message-22");
assert.equal(recent.at(-1)?.content, "마지막 질문");
const users: BetaMessageParam[] = Array.from({ length: 45 }, (_, index) => ({ role: "user", content: `user-${index}` }));
assert.deepEqual(buildMessages("user-44", users), users.slice(-40), "retain all 40 when the cutoff already starts with a user");
assert.equal(buildMessages("다시 질문", [{ role: "user", content: "이전" }, ...Array.from({ length: 45 }, () => answer)])[0].role, "user", "drop all assistants at the cutoff");

assert.deepEqual(buildMessages(question.content, []), [question], "empty history");
assert.deepEqual(buildMessages(question.content), [question], "default history");
console.log("PASS: greetings, deduplication, blank messages, immutable history, 40-message cutoff, empty/default history (16 assertions); no network or API key");
