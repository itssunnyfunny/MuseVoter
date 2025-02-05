import { prismaClient } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import {z} from 'zod'
const YT_REGEX = new RegExp("^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]+(&\S*)?$")


const CreateStreamSchema = z.object({
    creatorId : z.string(),
    url: z.string()
})

export async function POST(req:NextRequest) {
    try {
        const data = CreateStreamSchema.parse(await req.json());

        const isYt = YT_REGEX.test(data.url);
        if (!isYt) {
            return NextResponse.json({
                message: "Wrong url formate"
            },{
                status: 411
            }) 
        }

        const extractedId = data.url.split("?v=")[1];
        await prismaClient.stream.create({
          data: {
            userId: data.creatorId,
            url: data.url,
            extractedId,
            type: "youtube"
          }
        })
    } catch (error) {
        return NextResponse.json({
            message: "Error during creating Stream"
        },{
            status: 411
        })
    }
    
}