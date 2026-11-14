import { Info } from "@phosphor-icons/react";
import InfoRow from "./InfoRow";
import { getSkuSpecText, getSkuTotalStock, type ErpProduct, type ErpSku } from "../../pages/inventory/mockData";

type ProductRefCardProps = {
  product: ErpProduct;
  sku: ErpSku;
  /** 库存口径文案，缺省取该 SKU 的全仓总库存 */
  totalStock?: number;
  title?: string;
};

function ImageStrip({ label, images }: { label: string; images: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-400">
        {label} <span className="font-medium text-slate-400">（{images.length} 张）</span>
      </div>
      {images.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((src, index) => (
            <img
              key={`${index}-${src.slice(-16)}`}
              src={src}
              alt={`${label} ${index + 1}`}
              className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
            />
          ))}
        </div>
      ) : (
        <div className="mt-2 text-xs text-slate-400">未上传</div>
      )}
    </div>
  );
}

/**
 * ERP 商品主数据只读引用卡。
 * 用于商城上架配置、订单详情、库存详情等需要「展示来源数据但不允许修改」的场景。
 */
export default function ProductRefCard({ product, sku, totalStock, title = "以下信息来自 ERP 商品主数据，商城侧只读引用" }: ProductRefCardProps) {
  const stock = totalStock ?? getSkuTotalStock(sku);
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5">
      <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        <Info weight="bold" className="h-4 w-4" />
        {title}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <InfoRow label="生产厂家" value={product.manufacturer} />
        <InfoRow label="商品分类" value={product.category} />
        <InfoRow label="SKU 编码" value={sku.skuId} />
        <InfoRow label="规格" value={getSkuSpecText(sku)} />
        <InfoRow label="商品条码" value={sku.barcode} />
        <InfoRow label="有效期至" value={product.validityTo} />
        <InfoRow label="ERP 总库存" value={`${stock} 件`} />
        <InfoRow label="注册证 / 备案号" value={product.registrationNo} />
        <InfoRow label="生产许可证号" value={product.productionLicenseNo} />
        <InfoRow label="商品说明书" value={product.manualName} />
      </div>
      <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-2">
        <ImageStrip label="商品图片" images={product.images} />
        <ImageStrip label="资质凭证图片" images={product.certificateImages} />
      </div>
    </div>
  );
}
