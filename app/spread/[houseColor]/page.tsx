"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from '@/contexts/AuthContext'

const HouseSpreadPage = () => { 
    //use params returns the string in the URL
    const { houseColor } = useParams();
    const student = useAuth().userDbData

    return (
        <div>{ houseColor }</div>
    )
  }
  export default HouseSpreadPage;