# Backend Structure - MVC Pattern

Esta estrutura segue o padrão **MVC (Model-View-Controller)** simplificado para organizar o código backend de forma clara e com baixa complexidade.

## 📁 Estrutura de Pastas

```
src/
├── config/          # Configurações (database, cron, etc.)
├── controllers/     # Controllers - lógica de controle das rotas
├── models/          # Models - interfaces e tipos
├── routes/          # Definições de rotas
├── services/        # Services - lógica de negócio
└── index.ts         # Arquivo principal da aplicação
```

## 🏗️ Padrão MVC Simplificado

### **Models** (`/models`)
- Contém interfaces e tipos TypeScript
- Define a estrutura dos dados
- Exemplos: `User.ts`, `CodeStats.ts`

### **Controllers** (`/controllers`) 
- Recebe requisições HTTP
- Chama os services apropriados
- Retorna respostas HTTP
- Exemplo: `UserController.ts`

### **Services** (`/services`)
- Contém a lógica de negócio
- Interage com APIs externas e banco de dados
- Exemplos: `UserService.ts`, `CodeStatsService.ts`

### **Routes** (`/routes`)
- Define as rotas da API
- Conecta rotas aos controllers
- Exemplo: `userRoutes.ts`

### **Config** (`/config`)
- Configurações da aplicação
- Database, cron jobs, etc.
- Exemplos: `database.ts`, `cron.ts`

## 🔄 Fluxo de Dados

```
Request → Routes → Controllers → Services → Database/APIs
                      ↓
Response ← Routes ← Controllers ← Services ← Database/APIs
```

## ✅ Vantagens desta Estrutura

1. **Separação de Responsabilidades**: Cada pasta tem uma função específica
2. **Baixa Complexidade**: Fácil de entender e manter
3. **Escalabilidade**: Fácil adicionar novos recursos
4. **Testabilidade**: Cada camada pode ser testada independentemente
5. **Reutilização**: Services podem ser reutilizados em diferentes controllers

## 🚀 Como Adicionar Novos Recursos

1. **Criar Model**: Definir interfaces em `/models`
2. **Criar Service**: Implementar lógica de negócio em `/services`
3. **Criar Controller**: Implementar controle de rotas em `/controllers`
4. **Criar Routes**: Definir rotas em `/routes`
5. **Registrar Routes**: Importar no `/routes/index.ts`

## 📝 Exemplo de Uso

```typescript
// 1. Model (models/Product.ts)
export interface Product {
  id: number;
  name: string;
  price: number;
}

// 2. Service (services/ProductService.ts)
export class ProductService {
  static async getProducts(): Promise<Product[]> {
    // lógica de negócio
  }
}

// 3. Controller (controllers/ProductController.ts)
export class ProductController {
  static async getProducts(req: Request, res: Response) {
    const products = await ProductService.getProducts();
    res.json({ products });
  }
}

// 4. Routes (routes/productRoutes.ts)
router.get('/products', ProductController.getProducts);
```

Esta estrutura mantém o código organizado, fácil de manter e com baixa complexidade!
