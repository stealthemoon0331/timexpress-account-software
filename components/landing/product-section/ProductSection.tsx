import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "../AnimatedAction";

type Product = {
  name: string;
  icon?: string;
  url: string;
};

type Props = {
  products: Product[];
  products1: Product[];
};

export const ProductsSection = ({ products, products1 }: Props) => (
  <AnimatedSection
    id="products"
    className="relative bg-gray-100 pt-4 md:pt-6 pb-14 overflow-hidden"
  >
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[url('/assets/img/03.svg')] bg-top bg-no-repeat bg-[length:100%_auto] pointer-events-none"
    ></div>
    <div className="container p-40 relative z-10 w-[65%]">
      {/* <div className="text-center space-y-4 mb-20">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Products</h2>
      </div> */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-10">
        {products.map((product) => (
          <Link href={product.url} key={product.name} className="text-center mb-6">
            <div className="flex flex-col items-center">
              <div className="bg-white w-[80px] h-[80px] shadow-xl rounded-md p-3 mb-2 hover:-translate-y-1 transition-transform duration-200">
                <Image
                  src={product.icon || "/placeholder.svg"}
                  alt={product.name}
                  className="rounded object-contain"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-700 truncate max-w-[8rem] leading-tight">
                {product.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-6">
        <Link href="#" className="text-center">
          <div className="flex flex-col items-center">
            <div className=" w-[80px] h-[80px] p-3 mb-2 hover:-translate-y-1 transition-transform duration-200"></div>
          </div>
        </Link>
        {products1.map((product) => (
          <Link href={product.url} key={product.name} className="text-center">
            <div className="flex flex-col items-center">
              <div className="bg-white w-[80px] h-[80px] rounded-md shadow-xl p-3 mb-2 hover:-translate-y-1 transition-transform duration-200">
                <Image
                  src={product.icon || "/placeholder.svg"}
                  alt={product.name}
                  className="rounded"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-700 truncate max-w-[8rem] leading-tight">
                {product.name}
              </p>
            </div>
          </Link>
        ))}
        <Link href="#" className="text-center">
          <div className="flex flex-col items-center">
            <div className=" w-[80px] h-[80px]  p-3 mb-2 hover:-translate-y-1 transition-transform duration-200"></div>
          </div>
        </Link>
      </div>
    </div>
  </AnimatedSection>
);
