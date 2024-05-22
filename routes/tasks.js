const express = require("express");
const path = require("path");
const fs = require("fs");
let tasks = require("../data/tasks.json");

const router = express.Router();

router.get("/tasks", (req, res) => {
  // #swagger.summary = "Get all tasks from the tasks.json and return them as JSON";
  // #swagger.tags = ["Tasks"]
  // #swagger.description = "This route returns all tasks from the tasks.json file."
  if (!req.session.user) {
    return res.status(401).send("Not logged in");
  }

  res.setHeader("Content-Type", "application/json").status(200).send(tasks);
});

router.get("/tasks/:id", (req, res) => {
  // #swagger.summary = "Get task by id from tasks.json and return it as JSON";
  // #swagger.tags = ["Tasks"]
  // #swagger.description = "This route returns a task by its id from the tasks.json file."
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const { id } = req.params;
  const findArray = tasks.find((element) => element.id === id);

  if (!findArray) {
    return res.status(404).send("Task not found");
  }

  res.setHeader("Content-Type", "application/json").send(findArray);
});

router.post("/tasks", (req, res) => {
  // #swagger.summary = "Create task and add it to tasks.json and return it as JSON";
  // #swagger.tags = ["Tasks"]
  // #swagger.description = "This route creates a task and adds it to the tasks.json file. If the user is not logged in, a 401 status code is returned."
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  if (!req.body) {
    return res.status(400).send("No task data provided");
  }

  const id = crypto.randomUUID();

  const creator = req.session.user;
  console.log(creator);

  const { title, description, doneAt } = req.body;

  console.log(req.body);

  if (!title) {
    return res.status(422).json({ message: "Title is required" });
  }

  const allowedFields = ["title", "description", "doneAt"];
  const additionalFields = Object.keys(req.body).filter(
    (key) => !allowedFields.includes(key)
  );
  if (additionalFields.length > 0) {
    return res
      .status(422)
      .send(`Prohibited fields found: ${additionalFields.join(", ")}`);
  }

  const postArray = [
    ...tasks,
    {
      id,
      title,
      description,
      doneAt,
      creator,
    },
  ];
  tasks = postArray;

  fs.writeFile(
    path.join(__dirname, "../data/tasks.json"),
    JSON.stringify(tasks, null, 2),
    (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .send("An error occurred while writing to the file.");
      }

      return res
        .setHeader("Content-Type", "application/json")
        .status(201)
        .send(tasks);
    }
  );
});

router.put("/tasks/:id", (req, res) => {
  // #swagger.summary = "Update task by id from tasks.json and return it as JSON";
  // #swagger.tags = ["Tasks"]
  // #swagger.description = "This route updates a task by its id from the tasks.json file. If the user is not logged in, a 401 status code is returned."
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const { id } = req.params;
  const creator = req.body.user;
  const taskIndex = tasks.findIndex((element) => element.id === id);

  // eslint-disable-next-line no-negated-condition
  if (taskIndex !== -1) {
    const allowedFields = ["title", "description", "doneAt"];
    const additionalFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );
    if (additionalFields.length > 0) {
      return res
        .status(422)
        .send(`Prohibited fields found: ${additionalFields.join(", ")}`);
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body, creator };

    fs.writeFile(
      path.join(__dirname, "../data/tasks.json"),
      JSON.stringify(tasks, null, 2),
      (err) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .send("An error occurred while writing to the file.");
        }

        return res
          .setHeader("Content-Type", "application/json")
          .status(201)
          .send(tasks[taskIndex]);
      }
    );
  } else {
    res.status(404).send("No task found!");
  }
});

router.delete("/tasks/:id", (req, res) => {
  // #swagger.summary = "Delete task by id from tasks.json and return it as JSON";
  // #swagger.tags = ["Lends"]
  // #swagger.description = "This route deletes a lend by its id from the lend.json file. If the user is not logged in, a 401 status code is returned."
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const { id } = req.params;

  const findArray = tasks.find((element) => element.id === id);
  if (!findArray) {
    return res.status(404).send("Task not found");
  }

  const date = new Date();
  const formattedDate = date.toISOString();

  findArray.doneAt = formattedDate;

  tasks = findArray;

  fs.writeFile(
    path.join(__dirname, "../data/tasks.json"),
    JSON.stringify(tasks, null, 2),
    (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .send("An error occurred while writing to the file.");
      }

      return res
        .setHeader("Content-Type", "application/json")
        .status(201)
        .send(tasks);
    }
  );
});

module.exports = router;
