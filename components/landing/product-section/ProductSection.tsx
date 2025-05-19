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
  <AnimatedSection id="products" className="relative bg-gray-100 pt-4 md:pt-6 pb-14 overflow-hidden">
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[url('https://shiper.io/assets/img/03.svg?c4=%23ffffff')] bg-top bg-no-repeat bg-[length:100%_auto] pointer-events-none"
    ></div>
    <div className="container p-40 relative z-10">
      <div className="text-center space-y-4 mb-20">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Products</h2>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-8">
        {products.map((product) => (
          <Link href={product.url} key={product.name} className="text-center">
            <div className="flex flex-col items-center p-2 hover:-translate-y-1 transition-transform duration-200">
              <div className="bg-white rounded-md shadow-sm p-3 mb-2">
                <Image
                  src={product.icon || "/placeholder.svg"}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="rounded"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-700 truncate max-w-[8rem] leading-tight">
                {product.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center items-center gap-8 mt-8">
        {products1.map((product) => (
          <Link href={product.url} key={product.name} className="text-center">
            <div className="flex flex-col items-center p-2 hover:-translate-y-1 transition-transform duration-200">
              <div className="bg-white rounded-md shadow-sm p-3 mb-2">
                <Image
                  src={product.icon || "/placeholder.svg"}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="rounded"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-700 truncate max-w-[8rem] leading-tight">
                {product.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </AnimatedSection>
);
