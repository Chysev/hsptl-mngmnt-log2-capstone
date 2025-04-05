import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

type OrderProduct = {
    id: string
    name: string
    quantity: number
    price: number
}

export async function generateInvoicePdf(
    orderId: string,
    destination: string,
    products: OrderProduct[]
) {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    let y = height - 50

    const fontSize = 14

    // Header
    page.drawText(`Invoice #${orderId}`, {
        x: 50,
        y,
        size: 20,
        font,
        color: rgb(0, 0, 0),
    })

    y -= 30

    page.drawText(`Destination: ${destination}`, {
        x: 50,
        y,
        size: fontSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
    })

    y -= 30
    page.drawText(`Products:`, { x: 50, y, size: fontSize, font })

    y -= 20

    // Product Lines
    products.forEach((product, index) => {
        const subtotal = product.price * product.quantity
        const line = `${index + 1}. ${product.name} × ${product.quantity} @ $${product.price.toFixed(2)} = $${subtotal.toFixed(2)}`
        page.drawText(line, {
            x: 60,
            y,
            size: fontSize,
            font,
            color: rgb(0.1, 0.1, 0.1),
        })
        y -= 20
    })

    // Total
    const total = products.reduce((sum, p) => sum + p.quantity * p.price, 0)
    y -= 20

    page.drawText(`Total: $${total.toFixed(2)}`, {
        x: 50,
        y,
        size: 16,
        font,
        color: rgb(0, 0.5, 0),
    })

    // Save and trigger download
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${orderId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
}
