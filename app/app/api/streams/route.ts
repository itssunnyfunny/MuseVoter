import { prismaClient } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Stream } from 'stream';
import {z} from 'zod'
const YT_REGEX: RegExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:(?:watch\?(?:.*&)?v=)|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&]\S*)?$/;


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
      const stream =   await prismaClient.stream.create({
          data: {
            userId: data.creatorId,
            url: data.url,
            extractedId,
            type: "youtube"
          }
        })
        NextResponse.json({
            message: "Stream is Added",
            id: stream.id

        })
    } catch (error) {
        return NextResponse.json({
            message: "Error during creating Stream",
        },{
            status: 411
        })
    }
    
}


export async function GET(req:NextRequest) {

    const creatorId = req.nextUrl.searchParams.get("creatorId");

    const streams = await prismaClient.stream.findMany({
        where: {
            userId: creatorId ?? ""
        }
    });

    return NextResponse.json({
        streams
    })
}