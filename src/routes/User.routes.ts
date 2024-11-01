import { Hono } from "hono";
import { getPrisma } from '../lib/prismaClient'
import { decode, sign, verify } from 'hono/jwt'

const UserRouter = new Hono<{ Bindings: { DATABASE_URL: string ,JWT_SECRET :string } }>()


UserRouter.get("/allusers",async (c)=>{
  const prisma = getPrisma(c.env.DATABASE_URL) // Get the Prisma client
  const allusers = await prisma.user.findMany();
  return c.json(allusers);
})

UserRouter.post('/signup', async (c) => {
    const body = await c.req.json()  
    const prisma = getPrisma(c.env.DATABASE_URL) // Get the Prisma client
    try {    
  
      const checkuserexist = await prisma.user.findUnique({
        where: { email: body.email },
      })
  
      if (checkuserexist) {
        c.status(409)
        return c.text('Email already exists')
      }
  
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: body.password,
          name: body.name,
        },
      })
      const jwt = await sign({id:user.id},"123" )
      
      return c.json({
        msg: 'success',
        jwt: jwt,
      })
    } catch (error) {
      console.log(error)
      c.status(411)
      return c.text('Invalid data')
    }
  })
  
UserRouter.post('/signin', async (c) => {
    const body = await c.req.json();
    const prisma = getPrisma(c.env.DATABASE_URL); // Get the Prisma client
  
    try {
      // Check if the user exists based on email
      const user = await prisma.user.findUnique({
        where: { email: body.email },
      });
  
      // If user does not exist, return 401
      if (!user) {
        c.status(401);
        return c.text('User not found');
      }
  
      // Validate password (assuming you store hashed passwords)
      const isPasswordValid = user.password === body.password; // You should use bcrypt for hashing comparison
  
      if (!isPasswordValid) {
        c.status(401);
        return c.text('Invalid password');
      }
  
      // User exists and password is valid, generate JWT
      const jwt = await sign({ id: user.id }, "123"); // Use your JWT secret here
  
      return c.json({
        msg: 'success',
        jwt: jwt,
      });
  
    } catch (error) {
      console.log(error);
      c.status(500); // Change to 500 for server errors
      return c.text('Internal server error');
    }
  });

export default UserRouter