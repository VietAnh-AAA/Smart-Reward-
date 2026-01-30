
import { GoogleGenAI, Type } from "@google/genai";
import { StructuredDeal, GroundingSource } from "../types";

const getAIInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
};

const PROMOTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    deals: {
      type: Type.ARRAY,
      description: "Danh sách ưu đãi tổng hợp từ toàn bộ thị trường tài chính Việt Nam",
      items: {
        type: Type.OBJECT,
        properties: {
          partnerName: { type: Type.STRING, description: "Tên thương hiệu (VD: Shopee, Grab, Highlands)" },
          discountDetail: { type: Type.STRING, description: "Nội dung ưu đãi chi tiết" },
          category: { type: Type.STRING, description: "Ẩm thực, Mua sắm, Du lịch, Khác" },
          paymentMethodSource: { type: Type.STRING, description: "Tên ngân hàng hoặc ví (VD: Vietcombank, Techcombank, MoMo, ZaloPay...)" },
          cardNetwork: { type: Type.STRING, description: "Visa, Mastercard, JCB, Napas hoặc Tất cả" },
          expiryDate: { type: Type.STRING, description: "Ngày hết hạn DD/MM/YYYY" },
          terms: { type: Type.STRING }
        },
        required: ["partnerName", "discountDetail", "category", "paymentMethodSource"]
      }
    }
  }
};

export const syncGlobalPromotions = async (ignored: string[]) => {
  const ai = getAIInstance();
  
  const systemInstruction = `Bạn là hệ thống Scraper chuyên nghiệp của SmartPay. 
    Nhiệm vụ: Sử dụng Google Search để tìm kiếm và lập danh mục TẤT CẢ các chương trình khuyến mãi hiện có của:
    1. Toàn bộ các ngân hàng tại Việt Nam (VCB, TCB, VPB, MB, VIB, ACB, BIDV, Agribank, MSB, HDBank, OCB, TPBank...).
    2. Tất cả các ví điện tử và ứng dụng thanh toán (MoMo, ZaloPay, ShopeePay, Viettel Money, VNPay, Apple Pay, Samsung Pay).
    3. Các chương trình tích điểm thưởng (VinID, GrabRewards, BePoint).
    Yêu cầu: Lấy tối thiểu 50-60 ưu đãi đa dạng nhất. Dữ liệu phải thực tế và đang còn hiệu lực.`;

  const prompt = `Hãy quét toàn bộ thị trường và trả về danh sách ưu đãi đầy đủ nhất cho mọi loại thẻ và ví tại Việt Nam. Trả về định dạng JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: PROMOTION_SCHEMA
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || "Nguồn tin cậy",
        uri: chunk.web.uri
      }));

    const text = response.text || '{"deals": []}';
    let parsedData = JSON.parse(text);

    return {
      deals: parsedData.deals as StructuredDeal[],
      sources: sources
    };
  } catch (error) {
    console.error("Scraper Error:", error);
    throw error;
  }
};
