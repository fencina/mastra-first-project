import crypto from 'crypto'
import axios from 'axios'
import { z } from 'zod'

const BINANCE_API_BASE = process.env.BINANCE_API_BASE ?? 'https://api.binance.com'
const BINANCE_API_KEY = process.env.BINANCE_API_KEY
const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET

// Offset in milliseconds between server time and local time.
let serverTimeOffsetMs = 0

async function syncServerTime (): Promise<number> {
  try {
    const res = await axios.get(`${BINANCE_API_BASE}/api/v3/time`)
    const serverTime = Number(res.data?.serverTime)
    if (Number.isFinite(serverTime)) {
      serverTimeOffsetMs = serverTime - Date.now()
    }
  } catch {
    // If time sync fails, keep previous offset (default 0)
  }
  return serverTimeOffsetMs
}

/**
 * Esquema y tipos para respuestas de Binance
 */
export const TickerPriceSchema = z.object({
  symbol: z.string(),
  price: z.string(),
})
export type TickerPrice = z.infer<typeof TickerPriceSchema>

export const AccountBalanceSchema = z.object({
  asset: z.string(),
  free: z.string(),
  locked: z.string(),
})
export type AccountBalance = z.infer<typeof AccountBalanceSchema>

export const AccountInfoSchema = z.object({
  makerCommission: z.number(),
  takerCommission: z.number(),
  buyerCommission: z.number(),
  sellerCommission: z.number(),
  canTrade: z.boolean(),
  canWithdraw: z.boolean(),
  canDeposit: z.boolean(),
  brokered: z.boolean().optional(),
  updateTime: z.number(),
  accountType: z.string(),
  balances: z.array(AccountBalanceSchema),
  permissions: z.array(z.string()).optional(),
})
export type AccountInfo = z.infer<typeof AccountInfoSchema>

/**
 * Realiza una petición a la API de Binance para obtener información de la cuenta
 * (balances, permisos, etc.). Filtra balances en cero del lado del cliente si se solicita.
 */
export async function fetchAccount (
  omitZeroBalances: boolean = true
): Promise<AccountInfo> {
  if (!BINANCE_API_KEY || !BINANCE_API_SECRET) {
      throw new Error(
        'Credenciales de Binance no encontradas. Define BINANCE_API_KEY y BINANCE_API_SECRET en las variables de entorno.'
      )
    }

  const makeParams = (): URLSearchParams => {
    const timestamp = Date.now() + serverTimeOffsetMs
    const p = new URLSearchParams({ timestamp: String(timestamp) })
    const sig = signQuery(p.toString(), BINANCE_API_SECRET)
    p.append('signature', sig)
    return p
  }

  const requestOnce = async (): Promise<AccountInfo> => {
    const params = makeParams()
    const res = await axios.get(`${BINANCE_API_BASE}/api/v3/account`, {
      // Pass URLSearchParams directly so the exact signed string is sent
      params,
      headers: { 'X-MBX-APIKEY': BINANCE_API_KEY },
    })
    const parsed = AccountInfoSchema.parse(res.data)
    if (!omitZeroBalances) return parsed
    return {
      ...parsed,
      balances: parsed.balances.filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0),
    }
  }

  try {
    return await requestOnce()
  } catch (err: any) {
    const code = err?.response?.data?.code
    const msg: string = err?.response?.data?.msg ?? ''
    const isInvalidTimestamp = code === -1021 || /INVALID_TIMESTAMP/i.test(msg)

    if (isInvalidTimestamp) {
      await syncServerTime()
      // Retry once after syncing server time
      return await requestOnce()
    }

    const status = err?.response?.status ?? 'desconocido'
    const message = err?.response?.data ?? err.message
    throw new Error(`Error de la API de Binance: ${status} ${message}`)
  }
}

/**
 * Utilidad interna para firmar las cadenas de consulta necesarias por la API de Binance.
 * Binance requiere que las peticiones privadas se firmen con HMAC SHA256 usando la clave secreta.
 * Esta función genera la firma para el querystring dado.
 *
 * @param queryString Cadena de consulta (sin firma) a firmar
 * @param secret Clave secreta de la API de Binance
 */
function signQuery (queryString: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(queryString).digest('hex')
}

/**
 * Obtiene el precio actual de un símbolo (por ejemplo, BTCUSDT) usando el endpoint público.
 *
 * @param symbol Símbolo de trading (mayúsculas)
 */
export async function fetchTickerPrice (symbol: string): Promise<TickerPrice> {
  try {
    const res = await axios.get(`${BINANCE_API_BASE}/api/v3/ticker/price`, {
      params: { symbol: symbol.toUpperCase() },
    })
    return TickerPriceSchema.parse(res.data)
  } catch (err: any) {
    const status = err?.response?.status ?? 'desconocido'
    const message = err?.response?.data ?? err.message
    throw new Error(`Error al obtener el precio: ${status} ${message}`)
  }
}
