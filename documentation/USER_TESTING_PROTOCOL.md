# User Testing Protocol

A short moderated usability test for **South African Inequality, Explained**, sized for
1–3 participants. It is written to be run by one moderator with one participant at a time.

**Nothing in this file is filled in.** The results template at the end is blank on purpose:
the observations must come from real sessions.

---

## Before the session

Have ready:

- The site running at `npm run dev`, opened at the **Overview** page, sidebar visible
- A desktop or laptop browser at a normal window size, plus a phone if the participant
  has one they are willing to use for task 5
- A timer, and this document open for note-taking
- Nothing else on screen: no notes, no console, no dev tools

Say to the participant, in your own words:

> This is a website about inequality in South Africa. I am testing the website, not you.
> There are no wrong answers. Please think out loud as you go — say what you are looking
> at, what you expect, and anything that confuses you. If you get stuck, that is useful
> information for me, so please say so rather than pushing through silently.

Ask permission before taking any notes or recording. Do not help unless the participant
is stuck for more than about 90 seconds; if you do help, record that you did.

---

## Task 1 — Find a specific value in a time series

**Prompt to read aloud:** "Find the chart about South Africa's Gini coefficient, and tell
me the highest value it recorded and which year that was."

| | |
| :-- | :-- |
| **Goal** | Navigate to a named chart and extract a specific extreme value |
| **Success condition** | Participant states 0.65 and 2005, from any source on the page |
| **What to observe** | Do they use the sidebar, the overview cards, or search? Do they read the "Key insight" line above the chart, hover the line, read the on-chart annotation badge, or open the data table? Which did they reach for **first**? |

Note especially whether the participant reads the insight text at all, or goes straight
to hovering. That distinction is the main thing this task is for.

---

## Task 2 — Compare groups in survey data

**Prompt to read aloud:** "Using the survey charts, tell me which group of people reports
the greatest financial pressure, and what makes you say that."

| | |
| :-- | :-- |
| **Goal** | Choose an appropriate chart and interpret a group comparison |
| **Success condition** | Participant names a group and cites a value or comparison from a chart, rather than guessing |
| **What to observe** | Which chart do they choose — "Pressure by status", "Worry vs. income", "Pressure index"? Do they notice that some groups are very small (n=5)? Do they overstate a difference that rests on a handful of responses? |

This task deliberately has no single right answer. What matters is whether the participant
can justify their answer from the page, and whether they notice the sample-size caveat.

---

## Task 3 — Interpret a size encoding without help

**Prompt to read aloud:** "Open the 'Food & transport' chart. Without me explaining
anything, tell me what the size of the circles means."

| | |
| :-- | :-- |
| **Goal** | Read a non-obvious visual encoding unaided |
| **Success condition** | Participant says circle size represents the number of respondents |
| **What to observe** | Do they use the size key at the top right, the numbers printed inside the circles, hovering, or "How to read this chart" in the About panel? Do they say anything about the *area* looking bigger than the count? |

Do not point at the size key. If they ask what it is, note the question and say "whatever
you can work out from the page".

---

## Task 4 — Use Comparison Mode

**Prompt to read aloud:** "Put two charts side by side so you can compare them, then
change one of them to a different chart, then leave comparison mode."

| | |
| :-- | :-- |
| **Goal** | Discover, operate and exit a secondary mode |
| **Success condition** | Two charts shown side by side, one swapped, and the participant returns to the main view |
| **What to observe** | Do they find the "Compare" button? Once in, can they tell which pane is which chart? Do they read the text summary above the panes? How do they leave — the Exit button, Escape, or the browser back button? |

---

## Task 5 — Story Mode by keyboard only

**Prompt to read aloud:** "Start the guided story. From here on, please use only the
keyboard — no mouse or trackpad. Move forward through a few steps, go back one, then
leave the story."

| | |
| :-- | :-- |
| **Goal** | Complete a guided flow without a pointing device |
| **Success condition** | Participant advances at least two steps, moves back one, and exits |
| **What to observe** | Can they tell where keyboard focus is at each point? Do they discover the arrow keys, or Tab to the buttons and press Enter? Does anything trap focus? Do they know when they have left the story? |

If the participant is uncomfortable using only the keyboard, stop the task and record
that — do not push.

---

## After the session

Three questions, asked once, in this order:

1. What, if anything, was confusing or harder than you expected?
2. Was there anything on the page you did not understand the purpose of?
3. If you could change one thing about this site, what would it be?

---

## Results template

Copy this block once per participant. **Do not fill it in from memory** — write during or
immediately after the session.

```
Participant:            P__
Date:
Device / browser:
Screen size:
Prior familiarity with data charts (none / some / a lot):

--------------------------------------------------------------------
TASK 1 — Find the highest Gini value and year
Completed unaided:      yes / with help / no
Time:                   ____
Where they found it:
Errors / wrong turns:
Hesitation or confusion:
Verbatim comments:

--------------------------------------------------------------------
TASK 2 — Identify the group under greatest financial pressure
Completed unaided:      yes / with help / no
Time:                   ____
Chart chosen:
Answer given and their justification:
Did they notice the small-sample caveat:  yes / no
Errors / wrong turns:
Hesitation or confusion:
Verbatim comments:

--------------------------------------------------------------------
TASK 3 — Explain what circle size means
Completed unaided:      yes / with help / no
Time:                   ____
What they said size meant:
Source they used (size key / printed numbers / hover / About panel / guess):
Errors / wrong turns:
Hesitation or confusion:
Verbatim comments:

--------------------------------------------------------------------
TASK 4 — Comparison Mode
Completed unaided:      yes / with help / no
Time:                   ____
How they found Compare:
Could they tell which pane was which chart:  yes / no
Did they read the text summary:  yes / no / did not notice
How they exited:
Errors / wrong turns:
Hesitation or confusion:
Verbatim comments:

--------------------------------------------------------------------
TASK 5 — Story Mode, keyboard only
Completed unaided:      yes / with help / no
Time:                   ____
How they navigated (arrow keys / Tab + Enter / other):
Could they always tell where focus was:  yes / no
Anything that trapped focus:
Errors / wrong turns:
Hesitation or confusion:
Verbatim comments:

--------------------------------------------------------------------
CLOSING QUESTIONS
1. Confusing or harder than expected:
2. Anything whose purpose was unclear:
3. One thing they would change:

--------------------------------------------------------------------
MODERATOR NOTES
Times help was given, and what was said:
Anything that broke or behaved unexpectedly:
Observations not covered by the tasks above:
```

---

## Turning results into changes

For each issue observed in a real session, record it as:

```
Observation:   what the participant actually did or said
Participants:  how many of the __ tested hit this
Change made:   the specific edit, or "not changed" with the reason
Commit:
```

Do not record an issue that was not observed, and do not generalise from one participant
to a claim about users in general. With 1–3 participants the honest framing is
"P2 could not find X", not "users cannot find X".
