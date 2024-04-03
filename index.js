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

async function main() {
  require("dotenv").config();

  // Initialize a new Notion client with your API key
  const notion = new Client({ auth: process.env.NOTION_TOKEN });

  // Replace with the ID of the database where you want to create the assignments
  const databaseId = "cba1bb075e764bd3806786394348f368";

  // Define the assignments data
  const assignments = [];

  // add physics pre and post lecture assignments
  {
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

  // console.log(assignments);

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
  for (let i = 0; i < assignments.length; i++) {
    await createAssignment(notion, databaseId, assignments[i]);
  }
}

main();
