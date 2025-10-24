import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Gerar um UUID único para a referência do pagamento
    const uuid = crypto.randomUUID().replace(/-/g, '')
    
    // TODO: Armazenar o ID no banco de dados para verificar o pagamento depois
    // Por exemplo: await database.payments.create({ id: uuid, status: 'pending', ... })
    
    console.log('Payment initiated with ID:', uuid)
    
    return NextResponse.json({ 
      id: uuid,
      success: true 
    })
  } catch (error) {
    console.error('Error initiating payment:', error)
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}