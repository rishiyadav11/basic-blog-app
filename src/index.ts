import { Hono } from 'hono'
import userRouter from "./routes/User.routes"
import BlogRouter from "./routes/Blog.routes"

const app = new Hono<{ Bindings: { DATABASE_URL: string ,JWT_SECRET :string } }>()

app.get('/',(c)=>{
    return c.text("hello there")
})

app.route("/api/v1/user",userRouter)
app.route("/api/v1/blog",BlogRouter)



    

export default app
