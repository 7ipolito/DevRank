import { NextRequest, NextResponse } from 'next/server'
import { MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js'

interface IRequestPayload {
  payload: MiniAppPaymentSuccessPayload
}

export async function POST(req: NextRequest) {
  try {
    const { payload } = (await req.json()) as IRequestPayload

    // IMPORTANTE: Aqui devemos buscar a referência criada em /initiate-payment 
    // para garantir que a transação que estamos verificando é a mesma que iniciamos
    // const reference = await getReferenceFromDB(payload.reference)

    // 1. Verificar que a transação recebida do mini app é a mesma que enviamos
    if (payload.reference) {
      const response = await fetch(
        `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${process.env.NEXT_PUBLIC_APP_ID}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch transaction: ${response.statusText}`)
      }

      const transaction = await response.json()

      // 2. Aqui confirmamos otimisticamente a transação.
      // Caso contrário, você pode fazer polling até o status == mined
      if (transaction.reference === payload.reference && transaction.status !== 'failed') {
        console.log('Payment confirmed successfully:', payload.transaction_id)
        
        // TODO: Atualizar o status do pagamento no banco de dados
        // await database.payments.update({ 
        //   where: { id: payload.reference }, 
        //   data: { status: 'confirmed', transactionId: payload.transaction_id }
        // })
        
        return NextResponse.json({ 
          success: true,
          transactionId: payload.transaction_id,
          reference: payload.reference
        })
      } else {
        console.error('Transaction verification failed:', transaction)
        return NextResponse.json(
          { success: false, error: 'Transaction verification failed' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing reference' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}