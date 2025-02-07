import { prismaClient } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Stream } from 'stream';
//@ts-ignore
import youtubesearchapi from 'youtube-search-api'
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

        const res = await youtubesearchapi.GetVideoDetails(extractedId);
         const thumbnails = res.thumbnail.thumbnails;


         thumbnails.sort((a : {width: number},b: {width: number})=> a.width < a.width ? -1 : 1)

      const stream =   await prismaClient.stream.create({
          data: {
            userId: data.creatorId,
            url: data.url,
            extractedId,
            type: "youtube",
            title: res.tilte ?? "Can't find video",
            smallImg: thumbnails[thumbnails.length -1].url ?? "https://static.vecteezy.com/system/resources/thumbnails/008/568/878/small/website-page-not-found-error-404-oops-worried-robot-character-peeking-out-of-outer-space-site-crash-on-technical-work-web-design-template-with-chatbot-mascot-cartoon-online-bot-assistance-failure-vector.jpg",
            bigImg: thumbnails.length > 1 ? thumbnails[thumbnails.length -2].url : thumbnails[thumbnails.length - 1].url ?? "https://static.vecteezy.com/system/resources/thumbnails/008/568/878/small/website-page-not-found-error-404-oops-worried-robot-character-peeking-out-of-outer-space-site-crash-on-technical-work-web-design-template-with-chatbot-mascot-cartoon-online-bot-assistance-failure-vector.jpg"
          }
        })
      return  NextResponse.json({
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