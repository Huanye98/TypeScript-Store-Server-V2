# [Typecript-Store-v2] 

> **Status: Work In Progress/ Proof of Concept**

> This repository documents my deep dive into advanced backend development. It's an evolving project where I'm tackling complex e-commerce problems like database architecture for product variants, third-party API integration (Printful), and asynchronous order workflows. **This is not a finished product; it's also a portfolio of my learning process, architectural decisions, and the challenges I'm working through.**

## A note on this project's purpose
When I started this project, I had no understanding of backend architecture. Database schemas, Api design, and payment flows all felt like a black box. My earlier projects were built in a very naive way, if something worked I moved on, without thinking about scalability, maintainability, or best practices.

## Overview & evolution
[Previous Project link] https://github.com/Huanye98/Typescript-Store-Server

This is a major rewrite of a previous e-commerce backend , built with Typescript. The goal is to move beyong basic CRUD and explore the architecture of a real-world system.


New features & Experiments
 - More complex database: Redesigned SQL schema to support products with multiple options (e.g, T-shirt: size, color etc), and separation of internal and external orders using third-party services (Printful's print on demand)
 - Implementation of printful api for print on demand (products and shippment), with webhooks for automatic database updates 
 - Automated Invoicing: Pdf invoice generation with pupeteer (needs testing and debugging)
 - Testing Suite: Implementation of Jest for unit testing. 
 - Containerization: Includes a Dockerfile for potential future containerization.

## Lessons Learned

As I kept building, I inevitable ran into walls. Designing a database that could handle simple and complex products (like T-shirts with sizes and colors) made me realize how tricky real-world modeling is. Supporting both Internal and external orders (via Printful) pushed me to think about how different flows interact without breaking the system.

The payment wall: integrating Stripe taught me that charging money isnt a single step. Services like Printful wait for Stripe's confirmation before moving forward, which meant I had to handle asyncronous events, webhook verification, retries and states where an order could get "stuck".
Features like refunds, idempotency keys are not fully implemented yet, because I'm still learning the best way to handle them.

I also started noticing how data structures and algorithms play into backend design. Seeing my Railway receipts made me realize that inefficient code could literally cost me money. That sparked my interest in learning DSA, so I can make more informed decisions and write better code.

The biggest lesson is that the more I created, the more I realized that I needed to slow down, learn and investigate. Rushing ahead only led me into dead ends and burnout. Hitting walls forced me to pause dig deeper, and learn things the hard way.

Even though the output I generate now isn't complete, and many features are still in progress, I've developed a real respect for these challenges. Instead of being intimidated by the "hard parts", I see them as opportunities to grow. This project is shifting my mindset from just building features to really learn how backend systems are designed.

## Database Schema
![Schema](./Assets/Sql%20schema.png)

## Known Issues & limitations
This project is actively being worked on. Here are the specific challenges and open questions I'm curently grappling with:
 - Pupperteer Invoicing: The PDF generation module is unstable and needs debugging for consisten output.
 - Orders Crud: The Orders CRUD operations are not yet complete, which is blocking testing for invoice and fulfillments flows.
 - Architectural Decidions:
    - Final price calculation: I've implemente the final order price calculation on the server-side for internal orders. I'm actively researching the pros and cons of this approach versus doing the calculation directly in the SQL query or using a generated column in the database.
    - Product Storage Optimization: I'm concerned about optimizing how product and variant data is store and retrieved. This has led me to start really thinking and learning Data Structures and Algorithms to make more informed decisions in the future.
- Printful Api: The integration is started but not fully tested for all edge cases(handling out-of-stock items, webhook verification, etc)

## Roadmap & To Do
the immediate plan is as follows:

- [ ] Complete the order crud operations.
- [ ] Stabilize and debug the Pupeteer PDF invoice generator.
- [ ] Finalize the Printful API integration for creating orders.
- [ ] Write comprehensive tests for new features
- [ ] Keep completing the Readme (Endpoint structures, thought behind the SQL database system, Screenshots of dataflows and processes)

## Tech Stack
- **Language**: TypeScript (Node.js)
- **Database**: PostgreSQL
- **Testing**: Jest
- **Containerization**: Docker (planned)
- **Third-Party Services**: Printful API for print-on-demand fulfillment
- **Utilities**: Puppeteer for PDF generation

