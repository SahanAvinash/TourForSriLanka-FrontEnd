import { useState } from "react"
import { MdEmail, MdLock} from "react-icons/md";

export default function LoginPage(){
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")

    function handleOnSubmit(e: React.FormEvent<HTMLFormElement>){
       e.preventDefault()
       console.log(email, password)
    }

    return(
        <form onSubmit={handleOnSubmit}>
        <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745] flex justify-center items-center relative">
            <div className="absolute left-[80px]">
                <img src="/main_logo.png" alt="main_logo.png"/>
            </div>
            <div className="w-[500px] h-[500px] bg-[#253745] text-[#CCD0CF] absolute right-[80px] rounded-[20px] flex flex-col items-center">
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
                <button className="w-[400px] h-[50px] bg-[#00C896]/50 rounded-[20px] mt-[20px] text-[#CCD0CF] text-[20px] font-bold hover:bg-[#00C896]/80 transition-all duration-300 cursor-pointer">Sign in</button>
            </div>
        </div>
        </form>
    )
}