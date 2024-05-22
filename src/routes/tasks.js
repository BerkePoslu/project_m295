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
    console.log("Get Tasks failed: Not logged in");
    return res.sendStatus(401);
  }
  console.log("Get Tasks successful");
  res.setHeader("Content-Type", "application/json").status(200).send(tasks);
});

router.get("/tasks/:id", (req, res) => {
  // #swagger.summary = "Get task by id from tasks.json and return it as JSON";
  // #swagger.tags = ["Tasks"]
  // #swagger.description = "This route returns a task by its id from the tasks.json file."
  if (!req.session.user) {
    console.log("Get Task failed: Not logged in");
    return res.sendStatus(401);
  }

  const { id } = req.params;
  const findArray = tasks.find((element) => element.id === id);

  if (!findArray) {
    console.log("Get Task failed: Task not found");
    return res.sendStatus(404);
  }

  console.log("Get Task successful");
  res.setHeader("Content-Type", "application/json").status(200).send(findArray);
});

router.post("/tasks", (req, res) => {
  // #swagger.summary = "Create task and add it to tasks.json and return it as JSON";
  // #swagger.tags = ["Tasks"]
  // #swagger.parameters['title'] = { description: "Title of the task", required: true }
  // #swagger.parameters['description'] = { description: "Description of the task", required: false }
  // #swagger.parameters['doneAt'] = { description: "Date when the task was done", required: false }
  // #swagger.description = "This route creates a task and adds it to the tasks.json file. If the user is not logged in, a 401 status code is returned."
  if (!req.session.user) {
    console.log("Post Task failed: Not logged in");
    return res.sendStatus(401);
  }

  if (!req.body) {
    console.log("Post Task failed: No task data provided");
    return res.sendStatus(400);
  }

  const id = crypto.randomUUID();

  const creator = req.session.user;

  const { title, description, doneAt } = req.body;

  if (!title) {
    console.log("Post Task failed: Title is required");
    return res.sendStatus(422);
  }

  if (!description) {
    description = "";
  }

  if (!doneAt) {
    doneAt = null;
  }

  const allowedFields = ["title", "description", "doneAt"];
  const additionalFields = Object.keys(req.body).filter(
    (key) => !allowedFields.includes(key)
  );
  if (additionalFields.length > 0) {
    console.log("Post Task failed: Prohibited fields found");
    return res.sendStatus(422);
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
        console.log(
          "Post Task failed: An error occurred while writing to the file."
        );
        return res.sendStatus(500);
      }
      console.log("Post Task successful");
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
  // #swagger.parameters['id'] = { description: "Id of the task", required: true }
  // #swagger.description = "This route updates a task by its id from the tasks.json file. If the user is not logged in, a 401 status code is returned."
  if (!req.session.user) {
    console.log("Put Task failed: Not logged in");
    return res.sendStatus(401);
  }

  if (!req.body.title) {
    console.log("Put Task failed: Title is required");
    return res.sendStatus(422);
  }

  const { id } = req.params;
  const taskIndex = tasks.findIndex((element) => element.id === id);

  // eslint-disable-next-line no-negated-condition
  if (taskIndex !== -1) {
    const allowedFields = ["title", "description", "doneAt"];
    const additionalFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );

    if (additionalFields.length > 0) {
      console.log("Put Task failed: Prohibited fields found");
      return res.sendStatus(422);
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      title: req.body.title,
      description: req.body.description,
      doneAt: req.body.doneAt,
      creator: req.session.user,
    };

    fs.writeFile(
      path.join(__dirname, "../data/tasks.json"),
      JSON.stringify(tasks, null, 2),
      (err) => {
        if (err) {
          console.log(
            "Post Task failed: An error occurred while writing to the file."
          );
          return res.sendStatus(500);
        }
        console.log("Put Task successful");
        return res
          .setHeader("Content-Type", "application/json")
          .status(201)
          .send(tasks[taskIndex]);
      }
    );
  } else {
    res.sendStatus(404);
  }
});

router.delete("/tasks/:id", (req, res) => {
  // #swagger.summary = "Delete task by id from tasks.json and return it as JSON";
  // #swagger.tags = ["Tasks"];
  // #swagger.parameters['id'] = { description: "Id of the task", required: true };
  // #swagger.description = "This route deletes a task by adding a timestamp into doneAt to the task in the tasks.json file. If the user is not logged in, a 401 status code is returned."
  if (!req.session.user) {
    console.log("Delete Task failed: Not logged in");
    return res.status(401);
  }

  const { id } = req.params;

  const findArray = tasks.find((element) => element.id === id);
  if (!findArray) {
    console.log("Delete Task failed: Task not found");
    return res.status(404).send("Task not found");
  }

  const date = new Date().toLocaleString("de-CH", {
    timeZone: "Europe/Zurich",
  });
  findArray.doneAt = date;

  tasks = tasks.filter((element) => element.id !== id);
  tasks.push(findArray);

  fs.writeFile(
    path.join(__dirname, "../data/tasks.json"),
    JSON.stringify(tasks, null, 2),
    (err) => {
      if (err) {
        console.log(
          "Delete Task failed: An error occurred while writing to the file."
        );
        return res
          .setHeader("Content-Type", "application/json")
          .status(500)
          .json({ message: "An error occurred while writing to the file." });
      }
      console.log("Delete Task successful");
      return res
        .setHeader("Content-Type", "application/json")
        .status(201)
        .send(tasks);
    }
  );
});

module.exports = router;
