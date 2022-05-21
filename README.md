# BackendServer_ShareAMeal

Creating my first back-end server for the Share-A-Meal app.

## What is an API?

API is the acronym for Application Programming Interface, which is a software intermediary that allows two applications to talk to each other. Each time you use an app like Facebook, send an instant message, or check the weather on your phone, you're using an API.

## Why did I make this API?

It was an assignment for school at Avans for the subject Programming IV. The teacher made a functional Word-document and we had to design our API according to that. The documentation included users, meals (or movies, sometimes they're different objects) and the authentication for users for logging in. This also included generating a JWT token, which would be valid for a certain amount of days, hours, or miliseconds.

## What was my experience during this assignment?

Everything seemed to go super well at first, but I can't lie, I got a little confused with the logging in process. The overall theory was not hard, just the authentication and the generating of tokens in my opinion. And because it is a kind of spiderweb of things that are all connected, I did need to get those two right to be able to test out my API in the first place.

## How to use this API?

This API is made public on https://heroku-api-shareameal.herokuapp.com/ with a certain amount of endpoints. The API is connected to an online MySQL database that is hosted by my teacher, but anyone can use this link to access all the endpoints. In this code you will find routes, which include those endpoints. And you can use apps like Postman or Insomnia to send data to the database.
