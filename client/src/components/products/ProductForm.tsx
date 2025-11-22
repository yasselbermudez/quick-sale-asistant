import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useToast } from "../../hooks/useToast";
import { Modal } from "../common/Modal";

interface Product { 
  id: number; 
  name: string; 
  price: number;
  sku: string;
  stock: number;
}

interface ProductFormProps{
  isOpen:boolean,
  onClose:()=>void,
  product:Product|null
}

interface FormData {
  id:string;
  name: string;
  sku: string;
  price: string;
  stock: string;
}

interface FormErrors {
  name?: string;
  sku?: string;
  price?: string;
  stock?: string;
}

    // ProductForm Component
  export   function ProductForm({ isOpen, onClose, product }:ProductFormProps) {
      const [formData, setFormData] = useState<FormData>({
        id:'',
        name: '',
        sku: '',
        price: '',
        stock: ''
      });
      const [errors, setErrors] = useState<FormErrors>({});
      const [isSubmitting, setIsSubmitting] = useState(false);
      const { addProduct, updateProduct } = useProducts();
      const { addToast } = useToast();
      
      // Initialize form with product data if editing
      useEffect(() => {
        if (product) {
          setFormData({
            id:product.id.toString(),
            name: product.name,
            sku: product.sku||'',
            price: product.price.toString(),
            stock: product.stock?.toString() || '0'
          });
        } else {
          setFormData({
            id:'',
            name: '',
            sku: '',
            price: '',
            stock: ''
          });
        }
        setErrors({});
      }, [product, isOpen]);
      
      const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear specific error when field is changed
        if (errors[name as keyof FormErrors]) {
          setErrors(prev => ({ ...prev, [name]: null }));
        }
      };
      
      const validateForm = () => {
        const newErrors:FormErrors= {};
        
        if (!formData.name.trim()) {
          newErrors.name = 'El nombre es requerido';
        }
        
        if (!formData.sku.trim()) {
          newErrors.sku = 'El SKU es requerido';
        }
        
        const price = parseFloat(formData.price);
        if (isNaN(price) || price <= 0) {
          newErrors.price = 'El precio debe ser un número mayor a 0';
        }
        
        const stock = parseInt(formData.stock);
        if (isNaN(stock) || stock < 0) {
          newErrors.stock = 'El stock debe ser un número no negativo';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };
      
      const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) {
          return;
        }
        
        setIsSubmitting(true);
        
        const productData:Product = {
          id:parseInt(formData.id),
          name: formData.name,
          sku: formData.sku,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        };
        
        let success:boolean=false;
        
        if (product) {
          // Update existing product
          success = await updateProduct(product.id, productData);
          if (success) {
            addToast('Producto actualizado con éxito', 'success');
          }
        } else {
          // Create new product
          success = await addProduct(productData);
          if (success) {
            addToast('Producto creado con éxito', 'success');
          }
        }
        
        setIsSubmitting(false);
        
        if (success) {
          onClose();
        }
      };
      
      return (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title={product ? 'Editar Producto' : 'Nuevo Producto'}
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.sku ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Precio
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`block w-full pl-7 pr-12 py-2 border ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.stock ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Guardando...</span>
                  </div>
                ) : (
                  <span>{product ? 'Actualizar' : 'Crear'}</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      );
    }
    