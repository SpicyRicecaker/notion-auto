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

const ADD_PHYSICS = false;
const ADD_MATH = true;
const DRY_RUN = false;
const DBG = true;

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
    const week_1_day_1 = new Date("04/01/2024");

    let lecture_number = 1;
    // for every monday, tue, wed from 2024

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 2; k++) {
          let temp_date = new Date(week_1_day_1.getTime());
          temp_date.setDate(temp_date.getDate() + i * 7);

          let day_of_week_to_set = 1 + j * 2;
          let day_of_week_now = temp_date.getDay();
          let distance = day_of_week_to_set - day_of_week_now;
          // inspired by https://stackoverflow.com/a/11789820/11742422

          temp_date.setDate(temp_date.getDate() + distance);
          // console.log(temp_date.toLocaleString());
          temp_date.setUTCHours(k == 0 ? 10 + 7 : 23 + 7, 59, 59);

          assignments.push({
            name:
              k == 0
                ? `Get Ready for Lecture ${lecture_number}`
                : `Post-Lecture ${lecture_number}`,
            startDate: new Date(
              temp_date.toLocaleString("en-US", {
                timeZone: "America/Los_Angeles",
              }),
            ).toISOString(),
            subject: "PH 212",
          });
        }
        // this is jank but watvs
        lecture_number += 1;
      }
    }
  }
  // HOWTO:
  // CHANGE `days_with_pre_lecture`
  // The number at first index is week, second index is day
  if (ADD_MATH) {
    const week_1_day_1 = new Date("04/01/2024");

    /**
     * Given a list of days and a template name, 
     * adds numerically incrementing chars.
     * @constructor
     * @param {number[][]} days_with_assignment
     * @param {[number, number, number]} due_triplet
     */
    const add_these_to_assignments = (
      days_with_assignment,
      due_triplet,
      prepend,
      postpend,
    ) => {
      if (DBG) {
        console.log(prepend + "x" + postpend);
      }
      let assignment_number = 1;
      for (const a of days_with_assignment) {
        const week = a[0] - 1;
        const day = a[1];

        let temp_date = new Date(week_1_day_1.getTime());
        temp_date.setDate(temp_date.getDate() + week * 7);

        let day_of_week_now = temp_date.getDay();
        let distance = day - day_of_week_now;
        // inspired by https://stackoverflow.com/a/11789820/11742422

        temp_date.setDate(temp_date.getDate() + distance);
        // console.log(temp_date.toLocaleString());
        temp_date.setUTCHours(
          due_triplet[0] + 7,
          due_triplet[1],
          due_triplet[2],
        );

        if (DBG) {
          console.log(
            temp_date.toLocaleString("en-US", {
              timeZone: "America/Los_Angeles",
            }),
          );
        }
        assignments.push({
          name: `${prepend}${assignment_number++}${postpend}`,
          startDate: new Date(
            temp_date.toLocaleString("en-US", {
              timeZone: "America/Los_Angeles",
            }),
          ).toISOString(),
          subject: "MTH 256",
        });
      }
    };
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
    );
    
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
    );
    
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
    );
    
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
  }
}

main();
