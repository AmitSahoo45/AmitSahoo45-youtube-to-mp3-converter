import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface IpApiResponse {
    country_name: string;
    reason: string;
}

export async function GET(request: NextRequest) {
    const { headers } = request;
    // const userIP =
    //     headers.get('x-real-ip') ||
    //     headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    //     request.geo?.country

    // if (!userIP)
    //     return NextResponse.json({ error: 'Unable to determine IP address' }, { status: 500 });

    // return NextResponse.json({ country: data.country_name });
    return NextResponse.json({
        country: request.geo
    });
}