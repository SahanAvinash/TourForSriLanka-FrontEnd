import { useState } from "react"
import { MdEmail, MdLock} from "react-icons/md";
import axios from "axios"
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {Link} from "react-router-dom"

export default function LoginPage(){
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [rememberMe,setRememberMe] =useState(false)
    const navigate = useNavigate()

    function handleOnSubmit(e: React.FormEvent<HTMLFormElement>){
       e.preventDefault()

       axios.post("http://localhost:3000/api/login",
        {
            email : email,
            password : password,
            rememberMe
        }
       ).then((res)=>{
        console.log(res)
        toast.success("Login Success")
        const user = res.data.user
        const token = res.data.token
        const role = res.data.role

        if(rememberMe){
            localStorage.setItem("token",token)
            localStorage.setItem("user",JSON.stringify(user))
        }else{
            sessionStorage.setItem("token",token)
            sessionStorage.setItem("user",JSON.stringify(user))
        }
        if(role == "traveler"){
           navigate("/")
        }else if(user.role == "hotel_owner"){
            navigate("/hotel_owner/dashboard")
        }
       }).catch((err)=>{
        console.log(err)
        toast.error(err.response.data.error)
       })
       
    }

    return(
        <form onSubmit={handleOnSubmit}>
        <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745] flex justify-center items-center relative">
            <div className="absolute left-[80px]">
                <img src="/main_logo.png" alt="main_logo.png"/>
            </div>
            <div className="w-[500px] h-[450px] bg-[#253745] text-[#CCD0CF] absolute right-[10%] rounded-[20px] flex flex-col items-center">
                <h1 className="text-[25px] mt-[20px] font-bold">Sign in</h1>
                <span>Welcome back! Please signin </span>
                <span>to continue your journey.</span>
                <div className="group relative flex items-center mt-[20px]">
                    <MdEmail className="ml-[20px] text-[#00C896] absolute outline-none opacity-[50%] group-hover:opacity-[80%] transition-all duration-300"/>
                    <input type="email" placeholder="E-Mail" className="text-[#CCD0CF] text-[12px] w-[400px] h-[50px] bg-[#4A5C6A] rounded-[20px] pl-[50px]"
                        onChange={(e)=>{
                            setEmail(e.target.value)
                        }}
                    />
                </div>
                <div className="group relative flex items-center mt-[20px]">
                    <MdLock className="ml-[20px] text-[#00C896] absolute outline-none opacity-[50%] group-hover:opacity-[80%] transition-all duration-300"/>
                    <input type="password" placeholder="Password" className="text-[#CCD0CF] text-[12px] w-[400px] h-[50px] bg-[#4A5C6A] rounded-[20px] pl-[50px]"  
                        onChange={(e)=>{
                            setPassword(e.target.value)
                        }}
                    />
                </div>
                <div className="w-[400px] mt-[10px] flex justify-between">
                    <div>
                        <input type="checkbox" id="rememberMe" className="cursor-pointer" checked={rememberMe} onChange={(e)=> setRememberMe(e.target.checked)}/>
                        <label className="text-[12px] text-[#CCD0CF] pl-[5px]">Remember Me</label>
                    </div>
                    <label className="text-[12px] text-[#CCD0CF] mt-[5px] hover:text-[#00C896]/50 transition-all duration-300 cursor-pointer hover:underline">Forget Password?</label>
                </div>
                <button className="w-[400px] h-[50px] bg-[#00C896]/50 rounded-[20px] mt-[20px] text-[#CCD0CF] text-[20px] font-bold hover:bg-[#00C896]/80 transition-all duration-300 cursor-pointer">Sign in</button>
                <div className=" mt-[10px] w-[400px] flex justify-end">
                    <label className="text-[12px] text-[#CCD0CF]">Don't have an account? <Link to="/register-role" className="cursor-pointer hover:underline hover:text-[#00C896]/50 transition-all duration-300">Sign up</Link></label>
                </div>
            </div>
        </div>
        </form>
    )
}