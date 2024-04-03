// HOW TO USE:
// change the `ADD_PHSYICS` and `ADD_MATH` CONSTANTS to true or false
// run the program with `pnpm go`
const { Client } = require("@notionhq/client");

// Function to create a new assignment in the Notion database
async function createAssignment(notion, databaseId, assignment) {
  try {
    const response = await notion.pages.create({
      parent: { type: "database_id", database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: assignment.name,
              },
            },
          ],
        },
        Due: assignment.endDate
          ? {
              date: {
                start: assignment.startDate,
                end: assignment.endDate,
              },
            }
          : {
              date: {
                start: assignment.startDate,
              },
            },
        Status: {
          status: {
            name: "Not started",
          },
        },
        Subject: {
          select: {
            name: assignment.subject,
          },
        },
      },
    });
    console.log(`Assignment created: ${assignment.name}`);
  } catch (error) {
    console.error(`Error creating assignment: ${assignment.name}`, error);
  }
}

const DRY_RUN = false;
const DBG = true;

const ADD_PHYSICS = false;
const ADD_MATH = true;
const ADD_CHEM = true;

const to_iso_str_with_tz_offset = (some_date) => {
  const m = {};
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  })
    .formatToParts(some_date)
    .forEach(({ type: a, value: b }) => (m[a] = b));

  // iso 8601
  return `${m.year}-${m.month}-${m.day}T${m.hour}:${m.minute}:${m.second}-07:00`;
};

/**
 * Given a list of days and a template name,
 * adds numerically incrementing chars.
 * @constructor
 * @param {number[][]} days_with_assignment
 * @param {[number, number, number]} due_triplet
 */
const add_this_to_assignments = (
  due_triplet,
  prepend,
  postpend,
  subject,
  assignments,
  week,
  day,
  assignment_number,
) => {
  const week_1_day_1 = new Date("04/01/2024");
  let temp_date = new Date(week_1_day_1.getTime());
  temp_date.setDate(temp_date.getDate() + week * 7);

  let day_of_week_now = temp_date.getDay();
  let distance = day - day_of_week_now;
  // inspired by https://stackoverflow.com/a/11789820/11742422

  temp_date.setDate(temp_date.getDate() + distance);
  // console.log(temp_date.toLocaleString());
  temp_date.setHours(due_triplet[0], due_triplet[1], due_triplet[2]);

  if (DBG) {
    console.log(to_iso_str_with_tz_offset(temp_date));
  }
  assignments.push({
    name: `${prepend}${assignment_number}${postpend}`,
    startDate: to_iso_str_with_tz_offset(temp_date),
    subject: subject,
  });
};

const add_these_to_assignments = (
  days_with_assignment,
  due_triplet,
  prepend,
  postpend,
  subject,
  assignments,
) => {
  if (DBG) {
    console.log(prepend + "x" + postpend);
  }
  let assignment_number = 1;
  for (const a of days_with_assignment) {
    const week = a[0] - 1;
    const day = a[1];

    add_this_to_assignments(
      due_triplet,
      prepend,
      postpend,
      subject,
      assignments,
      week,
      day,
      assignment_number,
    );

    assignment_number += 1;
  }
};

// SEE THE COMMENTS BEFORE EACH IF STATEMENT ON HOW TO USE
async function main() {
  require("dotenv").config();

  // Initialize a new Notion client with your API key
  const notion = new Client({ auth: process.env.NOTION_TOKEN });

  // Replace with the ID of the database where you want to create the assignments
  const databaseId = "cba1bb075e764bd3806786394348f368";

  // Define the assignments data
  const assignments = [];

  // HOWTO: ALREADY DONE, PROBABLY NEVER ENABLE AGAIN
  // desc: adds physics pre and post lecture assignments
  if (ADD_PHYSICS) {
    let lecture_number = 1;
    // for every monday, tue, wed from 2024

    const pre_lec_due_triplet = [10, 59, 59];
    const post_lec_due_triplet = [23, 59, 59];

    for (let week = 0; week < 10; week++) {
      for (let j = 0; j < 3; j++) {
        let day = 1 + j * 2;

        for (let k = 0; k < 2; k++) {
          add_this_to_assignments(
            k == 0 ? pre_lec_due_triplet : post_lec_due_triplet,
            k == 0 ? "Get Ready for Lecture " : "Post-Lecture ",
            "",
            "PH 212",
            assignments,
            week,
            day,
            lecture_number,
          );
        }
        lecture_number += 1;
      }
    }
  }
  // HOWTO:
  // CHANGE `days_with_pre_lecture`
  // The number at first index is week, second index is day
  if (ADD_MATH) {
    // add pre lecture
    {
      const days_with_pre_lecture = [
        // first is week, second is day
        [1, 3],
        [2, 1],
        [2, 3],
        [3, 1],
        [3, 3],
        [4, 1],
        [4, 3],
        [5, 1],
      ];
      const pre_lecture_due_triplet = [13, 50, 0];
      add_these_to_assignments(
        days_with_pre_lecture,
        pre_lecture_due_triplet,
        "Pre-class Quiz ",
        "",
        "MTH 256",
        assignments,
      );
    }

    // add cda
    {
      const days_with_cda = [
        [1, 3],
        [2, 1],
        [2, 3],
        [3, 1],
        [3, 3],
        [4, 1],
        [4, 3],
        [5, 1],
      ];
      const cda_due_triplet = [23, 59, 59];
      add_these_to_assignments(
        days_with_cda,
        cda_due_triplet,
        "Class Discussion Activity ",
        "",
        "MTH 256",
        assignments,
      );
    }

    // add homework (webwork)
    {
      const days_with_homework = [
        [2, 7],
        [3, 7],
        [4, 7],
        [5, 7],
        [6, 7],
        [7, 7],
        [8, 7],
        [9, 7],
        [10, 7],
      ];
      const homework_due_triplet = [23, 59, 59];

      add_these_to_assignments(
        days_with_homework,
        homework_due_triplet,
        "Homework ",
        " (WeBWorK)",
        "MTH 256",
        assignments,
      );
    }
  }

  if (ADD_CHEM) {
    // add pre lecture
    {
      const days_with_pre_class_quiz = [
        // TENTATIVE, MAY CHANGE
        [1, 1],
        [1, 3],
        [2, 1],
        [2, 3],
        [3, 1],
        [3, 3],
        [4, 1],
        // [4, 3],
        [5, 1],
        [5, 3],
        [6, 1],
        [6, 3],
        [7, 1],
        [7, 3],
        [8, 1],
        // [8, 3],
        [9, 1],
        [9, 3],
        [10, 1],
        [10, 3],
      ];
      const pre_class_due_triplet = [23, 59, 59];

      add_these_to_assignments(
        days_with_pre_class_quiz,
        pre_class_due_triplet,
        "Pre-class quiz for Module ",
        "",
        "CH 232",
        assignments,
      );
    }
    // add quiz
    {
      const days_with_quiz = [
        // TENTATIVE, MAY CHANGE
        [2, 1],
        [3, 1],
        [4, 1],
        [5, 1],
        [6, 1],
        [7, 1],
        [8, 1],
        [9, 1],
        [10, 1],
      ];
      const quiz_due_triplet = [23, 59, 59];

      add_these_to_assignments(
        days_with_quiz,
        quiz_due_triplet,
        "Weekly Quiz ",
        "",
        "CH 232",
        assignments,
      );
    }
    // add mastering chemistry
    {
      const days_with_mastering_chem = [
        // TENTATIVE, MAY CHANGE
        [1, 7],
        [2, 7],
        [3, 7],
        [4, 3],
        [5, 7],
        [6, 7],
        [7, 7],
        [8, 3],
        [9, 7],
        [10, 7],
      ];
      const mastering_chem_due_triplet = [23, 59, 59];

      add_these_to_assignments(
        days_with_mastering_chem,
        mastering_chem_due_triplet,
        "Mastering Chemistry Week ",
        "",
        "CH 232",
        assignments,
      );
    }
  }

  if (DBG) {
    console.log(assignments);
  }

  // {
  //   name: "example assignment 1",
  //   startDate: "2024-04-02",
  //   endDate: "2024-04-03",
  //   subject: "PH 212",
  // },
  // {
  //   name: "example assignment 2",
  //   startDate: "2023-04-03T23:59:00-07:00",
  //   subject: "CH 232",
  // },

  // Loop through the assignments and create them in order in Notion
  if (!DRY_RUN) {
    for (let i = 0; i < assignments.length; i++) {
      await createAssignment(notion, databaseId, assignments[i]);
    }
    // await createAssignment(notion, databaseId, assignments[0]);
  }
}

main();
