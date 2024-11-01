import { Hono } from "hono";

import { getPrisma } from '../lib/prismaClient'
import { verify } from "hono/jwt";
const BlogRouter = new Hono<{ Bindings: { DATABASE_URL: string ,JWT_SECRET :string, },
Variables:{
    userId : string
} }>()

BlogRouter.get('/bulk', async (c) => {
    const prisma = getPrisma(c.env.DATABASE_URL); // Get the Prisma client
    
    try {
      // Attempt to find the post by id
      const blogs = await prisma.post.findMany();
  
      // Return the found blog post
      return c.json({ blogs: blogs });
  
    } catch (error) {
      console.log(error);
      c.status(500); // Change to 500 for server errors
      return c.text('Internal server error');
    }
  });
  


// Middleware to authenticate users
BlogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("Authorization") || "";  
  const token = authHeader.split(" ")[1];
  
  try {
    const user = await verify(token, "123"); // Replace "123" with your actual secret or use `c.env.JWT_SECRET`
    
    if (user && typeof user === "object" && "id" in user) {
      c.set("userId", user.id as string);
      await next(); // Await next() to allow subsequent handlers to run
    } else {
      c.status(401);
      return c.text("Unauthorized");
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    c.status(401);
    return c.text("Unauthorized");
  }
});


// BlogRouter.use("/*", async (c, next) => {
//   const authHeader = c.req.header("authorization") || "";
//   try {
//       const user = await verify(authHeader, "123");
//       if (user) {
//           c.set("userId", user.id);
//           await next();
//       } else {
//           c.status(403);
//           return c.json({
//               message: "You are not logged in"
//           })
//       }
//   } catch(e) {
//       c.status(403);
//       return c.json({
//           message: "You are not logged in"
//       })
//   }
// });



// Route to create a blog post
BlogRouter.post('/create', async (c) => {
  const body = await c.req.json();
  const userId = c.get('userId');
  const prisma = getPrisma(c.env.DATABASE_URL);
  
  try {
    const blog = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      },
    });
    return c.json({ blog });
  } catch (error) {
    console.error("Error creating post:", error);
    c.status(500);
    return c.text('Internal server error');
  }
});



BlogRouter.get('/:id', async (c) => {
    const id = c.req.param('id');
    const prisma = getPrisma(c.env.DATABASE_URL); // Get the Prisma client
    
    try {
      // Attempt to find the post by id
      const blog = await prisma.post.findUnique({
        where: {
          id: id,
        },
      });
  
      // Check if the blog post exists
      if (!blog) {
        c.status(404);
        return c.text('Blog post not found');
      }
  
      // Return the found blog post
      return c.json({ blog: blog });
  
    } catch (error) {
      console.log(error);
      c.status(500); // Change to 500 for server errors
      return c.text('Internal server error');
    }
  });
  

  
  BlogRouter.put('/update', async (c) => {
    const body = await c.req.json();
    const userId = c.get('userId');  // Make sure this middleware is setting userId correctly
  
    const prisma = getPrisma(c.env.DATABASE_URL); // Get the Prisma client
  
    try {
      const blog = await prisma.post.update({
        where: {
          id: body.id,
          authorId: userId,
        },
        data: {
          title: body.title,
          content: body.content,
        },
      });
  
      return c.json({
        msg: 'Blog updated successfully',
        blog,
      });
    } catch (error) {
      console.error(error);
      c.status(500);
      return c.text('Internal server error');
    }
  });
  

  export default BlogRouter;