import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.get("/", "ReviewsController.getAll");
  Route.post("/create", "ReviewsController.create");
  Route.post("/update", "ReviewsController.update");
  Route.delete("/delete", "ReviewsController.delete");
})
  .middleware(["jwtAuth"])
  .prefix("/reviews");
