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
    className="relative bg-gray-100 py-12 md:py-20 overflow-hidden"
  >
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[url('/assets/img/03.svg')] bg-top bg-no-repeat bg-[length:100%_auto] pointer-events-none"
    ></div>

    <div className="container relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Optional Heading */}
      {/* <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Products</h2>
      </div> */}

      {/* First Product Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 mb-8">
        {products.map((product) => (
          <Link href={product.url} key={product.name} className="text-center">
            <div className="flex flex-col items-center">
              <div className="bg-white w-20 h-20 shadow-xl rounded-md p-3 mb-2 hover:-translate-y-1 transition-transform duration-200">
                <Image
                  src={product.icon || "/placeholder.svg"}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="object-contain w-full h-full"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-700 truncate max-w-[8rem] leading-tight">
                {product.name}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Second Product Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
        {products1.map((product) => (
          <Link href={product.url} key={product.name} className="text-center">
            <div className="flex flex-col justify-center items-center">
              <div className="bg-white w-20 h-20 shadow-xl rounded-md p-3 mb-2 hover:-translate-y-1 transition-transform duration-200">
                <Image
                  src={product.icon || "/placeholder.svg"}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="object-contain w-full h-full"
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
