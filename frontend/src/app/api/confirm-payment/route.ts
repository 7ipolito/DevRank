import { NextRequest, NextResponse } from "next/server";

interface PaymentConfirmation {
  reference: string;
  status: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar se o body tem os dados necessários
    if (!body || !body.reference) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing payment reference",
        },
        { status: 400 }
      );
    }

    const paymentData: PaymentConfirmation = {
      reference: body.reference,
      status: body.status || "pending",
    };

    // Log para debug
    console.log("Payment confirmation received:", paymentData);

    // Aqui você pode adicionar a lógica para atualizar o pagamento no seu banco de dados

    return NextResponse.json({
      success: true,
      data: paymentData,
    });
  } catch (error) {
    console.error("Error processing payment confirmation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process payment confirmation",
      },
      { status: 500 }
    );
  }
}
