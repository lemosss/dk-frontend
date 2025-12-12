<template>
  <div class="landing">
    <!-- Header/Navbar -->
    <header class="navbar">
      <div class="navbar-content">
        <div class="logo">
          <div class="logo-icon">
            <FileText :size="24" />
          </div>
          <span class="logo-text">DK</span>
        </div>
        <nav class="nav-links">
          <a href="#features" @click.prevent="scrollTo('features')">Recursos</a>
          <a href="#how-it-works" @click.prevent="scrollTo('how-it-works')">Como Funciona</a>
          <a href="#benefits" @click.prevent="scrollTo('benefits')">Benefícios</a>
          <a href="#pricing" @click.prevent="scrollTo('pricing')">Planos</a>
        </nav>
        <button class="btn-nav" @click="goToLogin">
          Entrar
          <ArrowRight :size="18" />
        </button>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-gradient"></div>
        <div class="hero-pattern"></div>
        <div class="hero-glow"></div>
      </div>

      <div class="hero-content">
        <div class="hero-badge">
          <Sparkles :size="16" />
          <span>Plataforma #1 para Contadores</span>
        </div>

        <h1 class="hero-title">
          Pare de perder tempo
          <span class="hero-highlight">enviando notas por email</span>
        </h1>

        <p class="hero-subtitle">
          Centralize todas as notas fiscais dos seus clientes PJ, MEI e ME em uma única plataforma.
          Seus clientes acessam quando quiserem, você acompanha tudo em tempo real.
        </p>

        <div class="hero-cta">
          <button class="btn-primary" @click="goToRegister">
            Começar Gratuitamente
            <ArrowRight :size="20" />
          </button>
          <button class="btn-ghost" @click="scrollTo('how-it-works')">
            <Play :size="20" />
            Ver Demonstração
          </button>
        </div>

        <div class="hero-social-proof">
          <div class="avatars">
            <img
              v-for="(avatar, i) in avatarImages"
              :key="i"
              :src="avatar"
              :alt="`Usuário ${i + 1}`"
              class="avatar"
            />
          </div>
          <div class="social-proof-text">
            <div class="stars">
              <Star v-for="i in 5" :key="i" :size="16" fill="currentColor" />
            </div>
            <span>Usado por <strong>500+</strong> escritórios contábeis</span>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <div class="dashboard-mockup">
          <div class="mockup-header">
            <div class="mockup-dots">
              <span></span><span></span><span></span>
            </div>
            <div class="mockup-title">Dashboard - Notas Fiscais</div>
          </div>
          <div class="mockup-content">
            <div class="mockup-sidebar">
              <div class="sidebar-item active"><LayoutDashboard :size="18" /></div>
              <div class="sidebar-item"><FileText :size="18" /></div>
              <div class="sidebar-item"><Calendar :size="18" /></div>
              <div class="sidebar-item"><Users :size="18" /></div>
            </div>
            <div class="mockup-main">
              <div class="mockup-stats">
                <div class="stat-card">
                  <span class="stat-value">R$ 45.280</span>
                  <span class="stat-label">A Receber</span>
                </div>
                <div class="stat-card green">
                  <span class="stat-value">R$ 32.150</span>
                  <span class="stat-label">Recebido</span>
                </div>
                <div class="stat-card orange">
                  <span class="stat-value">12</span>
                  <span class="stat-label">Vencendo Hoje</span>
                </div>
              </div>
              <div class="mockup-table">
                <div class="table-row" v-for="i in 4" :key="i">
                  <div class="row-company"></div>
                  <div class="row-value"></div>
                  <div class="row-status" :class="i % 2 === 0 ? 'paid' : 'pending'"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="floating-card card-1">
          <CheckCircle :size="24" class="card-icon green" />
          <div>
            <strong>NF Paga</strong>
            <span>Tech Solutions - R$ 1.250</span>
          </div>
        </div>
        <div class="floating-card card-2">
          <Bell :size="24" class="card-icon orange" />
          <div>
            <strong>Vencimento Próximo</strong>
            <span>3 notas vencem amanhã</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Logos Section -->
    <section class="logos-section">
      <p class="logos-title">Confiado por escritórios em todo o Brasil</p>
      <div class="logos-grid">
        <div class="logo-item" v-for="i in 6" :key="i">
          <Building2 :size="28" />
          <span>Contabilidade {{ ['Alpha', 'Beta', 'Delta', 'Sigma', 'Prime', 'Elite'][i-1] }}</span>
        </div>
      </div>
    </section>

    <!-- Problem Section -->
    <section class="problem-section">
      <div class="problem-content">
        <div class="problem-text">
          <span class="section-badge red">O Problema</span>
          <h2 class="section-title-large">
            Você ainda envia notas fiscais por
            <span class="text-red">email e WhatsApp?</span>
          </h2>
          <ul class="problem-list">
            <li>
              <XCircle :size="24" class="icon-red" />
              <span>Horas perdidas organizando e enviando arquivos manualmente</span>
            </li>
            <li>
              <XCircle :size="24" class="icon-red" />
              <span>Clientes ligando perguntando "cadê minha nota?"</span>
            </li>
            <li>
              <XCircle :size="24" class="icon-red" />
              <span>Notas perdidas em conversas antigas do WhatsApp</span>
            </li>
            <li>
              <XCircle :size="24" class="icon-red" />
              <span>Nenhum controle sobre quem pagou ou não</span>
            </li>
            <li>
              <XCircle :size="24" class="icon-red" />
              <span>Planilhas desatualizadas e confusas</span>
            </li>
          </ul>
        </div>
        <div class="problem-visual">
          <div class="chaos-illustration">
            <div class="chaos-item email"><Mail :size="32" /></div>
            <div class="chaos-item whatsapp"><MessageCircle :size="32" /></div>
            <div class="chaos-item folder"><FolderOpen :size="32" /></div>
            <div class="chaos-item excel"><FileSpreadsheet :size="32" /></div>
            <div class="chaos-center">
              <Frown :size="48" />
              <span>Caos</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Solution Section -->
    <section class="solution-section">
      <div class="solution-content">
        <div class="solution-visual">
          <div class="order-illustration">
            <div class="order-center">
              <div class="dk-logo-large">
                <FileText :size="48" />
              </div>
            </div>
            <div class="order-orbit">
              <div class="orbit-item" v-for="(item, index) in orbitItems" :key="index" :style="{ '--delay': index * 0.5 + 's' }">
                <component :is="item.icon" :size="24" />
              </div>
            </div>
          </div>
        </div>
        <div class="solution-text">
          <span class="section-badge green">A Solução</span>
          <h2 class="section-title-large">
            Uma plataforma única para
            <span class="text-green">organizar tudo</span>
          </h2>
          <ul class="solution-list">
            <li>
              <CheckCircle :size="24" class="icon-green" />
              <span>Upload de notas em segundos, organização automática</span>
            </li>
            <li>
              <CheckCircle :size="24" class="icon-green" />
              <span>Cada cliente acessa suas notas pelo próprio login</span>
            </li>
            <li>
              <CheckCircle :size="24" class="icon-green" />
              <span>Calendário visual com todos os vencimentos</span>
            </li>
            <li>
              <CheckCircle :size="24" class="icon-green" />
              <span>Status de pagamento atualizado em tempo real</span>
            </li>
            <li>
              <CheckCircle :size="24" class="icon-green" />
              <span>Zero emails, zero WhatsApp, zero confusão</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features" ref="featuresSection">
      <div class="features-content">
        <div class="section-header">
          <span class="section-badge">Recursos</span>
          <h2 class="section-title-large">Tudo que você precisa em um só lugar</h2>
          <p class="section-description">
            Ferramentas poderosas para simplificar a gestão de notas fiscais do seu escritório
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.title">
            <div class="feature-icon" :style="{ background: feature.gradient }">
              <component :is="feature.icon" :size="28" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works" id="how-it-works">
      <div class="how-it-works-content">
        <div class="section-header">
          <span class="section-badge">Como Funciona</span>
          <h2 class="section-title-large">Simples como 1, 2, 3, 4</h2>
          <p class="section-description">
            Em minutos você organiza toda a gestão de notas do seu escritório
          </p>
        </div>

        <div class="steps-container">
          <div class="steps-line"></div>
          <div class="steps-grid">
            <div class="step-card" v-for="(step, index) in steps" :key="step.title">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-icon" :style="{ background: step.gradient }">
                <component :is="step.icon" :size="32" />
              </div>
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-description">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits/Stats Section -->
    <section class="benefits" id="benefits">
      <div class="benefits-content">
        <div class="section-header">
          <span class="section-badge">Resultados Reais</span>
          <h2 class="section-title-large">Por que contadores amam o DK?</h2>
          <p class="section-description">
            Números que comprovam a transformação nos escritórios que usam nossa plataforma
          </p>
        </div>

        <div class="stats-grid">
          <div class="stats-card" v-for="stat in stats" :key="stat.label">
            <div class="stats-icon-wrapper" :style="{ background: stat.gradient }">
              <component :is="stat.icon" :size="40" class="stats-icon" />
            </div>
            <div class="stats-info">
              <p class="stats-number">{{ stat.number }}</p>
              <p class="stats-label">{{ stat.label }}</p>
            </div>
          </div>
        </div>

        <div class="benefits-list-wrapper">
          <div class="benefit-card" v-for="benefit in benefits" :key="benefit.title">
            <div class="benefit-icon">
              <component :is="benefit.icon" :size="28" />
            </div>
            <div class="benefit-text">
              <h4>{{ benefit.title }}</h4>
              <p>{{ benefit.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials">
      <div class="testimonials-content">
        <div class="section-header">
          <span class="section-badge">Depoimentos</span>
          <h2 class="section-title-large">O que nossos clientes dizem</h2>
        </div>

        <div class="testimonials-grid">
          <div class="testimonial-card" v-for="testimonial in testimonials" :key="testimonial.name">
            <div class="testimonial-stars">
              <Star v-for="i in 5" :key="i" :size="18" fill="currentColor" />
            </div>
            <p class="testimonial-text">"{{ testimonial.text }}"</p>
            <div class="testimonial-author">
              <div class="author-avatar">{{ testimonial.name[0] }}</div>
              <div class="author-info">
                <strong>{{ testimonial.name }}</strong>
                <span>{{ testimonial.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing" id="pricing">
      <div class="pricing-content">
        <div class="section-header">
          <span class="section-badge">Planos</span>
          <h2 class="section-title-large">Escolha o plano ideal para seu escritório</h2>
          <p class="section-description">
            Comece grátis e escale conforme seu escritório cresce
          </p>
        </div>

        <div class="pricing-grid">
          <div class="pricing-card" v-for="plan in plans" :key="plan.name" :class="{ featured: plan.featured }">
            <div class="pricing-badge" v-if="plan.featured">Mais Popular</div>
            <h3 class="pricing-name">{{ plan.name }}</h3>
            <div class="pricing-price">
              <span class="price-currency">R$</span>
              <span class="price-value">{{ plan.price }}</span>
              <span class="price-period">/mês</span>
            </div>
            <p class="pricing-description">{{ plan.description }}</p>
            <ul class="pricing-features">
              <li v-for="feature in plan.features" :key="feature">
                <Check :size="18" />
                <span>{{ feature }}</span>
              </li>
            </ul>
            <button
              :class="plan.featured ? 'btn-primary' : 'btn-outline'"
              @click="goToPlan(plan.name.toLowerCase())"
            >
              {{ plan.cta }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq">
      <div class="faq-content">
        <div class="section-header">
          <span class="section-badge">FAQ</span>
          <h2 class="section-title-large">Perguntas Frequentes</h2>
        </div>

        <div class="faq-grid">
          <div class="faq-item" v-for="(faq, index) in faqs" :key="index">
            <button class="faq-question" @click="toggleFaq(index)">
              <span>{{ faq.question }}</span>
              <ChevronDown :size="20" :class="{ rotated: openFaq === index }" />
            </button>
            <div class="faq-answer" :class="{ open: openFaq === index }">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="final-cta">
      <div class="cta-content">
        <h2 class="cta-title">Pronto para transformar seu escritório?</h2>
        <p class="cta-description">
          Junte-se a centenas de contadores que já economizam horas toda semana com o DK.
          Comece gratuitamente, sem cartão de crédito.
        </p>
        <div class="cta-buttons">
          <button class="btn-cta-primary" @click="goToRegister">
            Criar Conta Grátis
            <ArrowRight :size="20" />
          </button>
          <a class="btn-cta-secondary" href="https://wa.me/5534984181429" target="_blank" rel="noopener noreferrer">
            <MessageCircle :size="20" />
            Falar com Especialista
          </a>
        </div>
        <p class="cta-note">
          <Shield :size="16" />
          Seus dados estão seguros. Cancele quando quiser.
        </p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-main">
          <div class="footer-brand">
            <div class="logo">
              <div class="logo-icon">
                <FileText :size="24" />
              </div>
              <span class="logo-text">DK</span>
            </div>
            <p>A plataforma de gestão de notas fiscais feita para contadores.</p>
          </div>
          <div class="footer-links">
            <div class="footer-column">
              <h4>Produto</h4>
              <a href="#">Recursos</a>
              <a href="#">Preços</a>
              <a href="#">Integrações</a>
            </div>
            <div class="footer-column">
              <h4>Empresa</h4>
              <a href="#">Sobre</a>
              <a href="#">Blog</a>
              <a href="#">Contato</a>
            </div>
            <div class="footer-column">
              <h4>Legal</h4>
              <a href="#">Termos</a>
              <a href="#">Privacidade</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 DK Invoice Calendar. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Sparkles,
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Calendar,
  Shield,
  Zap,
  TrendingUp,
  CheckCircle,
  UserPlus,
  Upload,
  Send,
  Eye,
  Clock,
  Target,
  Smile,
  ArrowRight,
  Play,
  Star,
  Bell,
  XCircle,
  Mail,
  MessageCircle,
  FolderOpen,
  FileSpreadsheet,
  Frown,
  Check,
  ChevronDown
} from 'lucide-vue-next'

const router = useRouter()
const featuresSection = ref<HTMLElement | null>(null)
const openFaq = ref<number | null>(null)

const avatarImages = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/75.jpg'
]

const goToRegister = () => {
  router.push('/register')
}

const goToLogin = () => {
  router.push('/admin/login')
}

const goToPlan = (planName: string) => {
  router.push(`/register?plan=${planName}`)
}

const scrollTo = (id: string) => {
  const element = document.getElementById(id)
  element?.scrollIntoView({ behavior: 'smooth' })
}

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index
}

const orbitItems = [
  { icon: FileText },
  { icon: Calendar },
  { icon: Users },
  { icon: Shield },
  { icon: TrendingUp },
  { icon: Bell }
]

const features = [
  {
    icon: Building2,
    title: 'Gestão Centralizada',
    description: 'Todos os seus clientes PJ, MEI e ME em um único painel organizado e intuitivo',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: FileText,
    title: 'Distribuição Automática',
    description: 'Pare de enviar emails! As notas ficam disponíveis automaticamente para cada cliente',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: Calendar,
    title: 'Calendário Inteligente',
    description: 'Visualize todos os vencimentos em um calendário único. Alertas automáticos inclusos',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    icon: Users,
    title: 'Portal do Cliente',
    description: 'Cada cliente tem seu próprio login e acessa apenas suas notas, 24 horas por dia',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: Shield,
    title: 'Segurança Bancária',
    description: 'Dados criptografados, backups automáticos e isolamento total entre clientes',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    icon: Zap,
    title: 'Upload Rápido',
    description: 'Arraste e solte PDFs. Em segundos as notas estão organizadas e disponíveis',
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  }
]

const steps = [
  {
    icon: UserPlus,
    title: 'Cadastre Clientes',
    description: 'Adicione suas empresas (PJ, MEI, ME) e crie logins de acesso para cada uma',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: Upload,
    title: 'Upload das Notas',
    description: 'Faça upload dos PDFs, informe valores e vencimentos. Pronto!',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: Send,
    title: 'Acesso Automático',
    description: 'Seus clientes já podem acessar as notas pelo portal deles',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    icon: Eye,
    title: 'Acompanhe Tudo',
    description: 'Veja quem pagou, quem não pagou e os próximos vencimentos',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  }
]

const stats = [
  {
    icon: Clock,
    number: '10h',
    label: 'Economizadas por Semana',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: TrendingUp,
    number: '3x',
    label: 'Mais Produtividade',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: Target,
    number: '0',
    label: 'Notas Perdidas',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    icon: Smile,
    number: '100%',
    label: 'Clientes Satisfeitos',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  }
]

const benefits = [
  {
    icon: Clock,
    title: 'Elimine o Retrabalho',
    description: 'Pare de responder "onde está minha nota?" - seus clientes acessam sozinhos'
  },
  {
    icon: Calendar,
    title: 'Nunca Mais Perca Prazos',
    description: 'Calendário visual com todos os vencimentos e alertas automáticos'
  },
  {
    icon: TrendingUp,
    title: 'Escale seu Escritório',
    description: 'Atenda mais clientes sem aumentar a equipe. Automatize o operacional'
  },
  {
    icon: Shield,
    title: 'Profissionalismo',
    description: 'Impressione seus clientes com um portal moderno e organizado'
  },
  {
    icon: Smile,
    title: 'Clientes Mais Felizes',
    description: 'Autonomia para acessar documentos a qualquer hora, sem depender de você'
  },
  {
    icon: Zap,
    title: 'Setup em 5 Minutos',
    description: 'Sem instalação, sem complicação. Crie sua conta e comece a usar'
  }
]

const testimonials = [
  {
    name: 'Ricardo Mendes',
    role: 'Contador - RM Contabilidade',
    text: 'Economizo pelo menos 10 horas por semana desde que comecei a usar o DK. Meus clientes adoram ter acesso às notas pelo celular.'
  },
  {
    name: 'Patricia Silva',
    role: 'Sócia - Silva & Associados',
    text: 'Finalmente consegui organizar meu escritório. Antes era um caos de emails e WhatsApp. Agora tudo está em um lugar só.'
  },
  {
    name: 'Carlos Eduardo',
    role: 'Contador Autônomo',
    text: 'O melhor investimento que fiz no meu escritório. Consegui dobrar minha carteira de clientes sem contratar ninguém.'
  }
]

const plans = [
  {
    name: 'Starter',
    price: '0',
    description: 'Perfeito para começar',
    features: [
      '1 cliente',
      'Upload ilimitado de notas',
      'Portal do cliente',
      'Calendário básico'
    ],
    cta: 'Começar Grátis',
    featured: false
  },
  {
    name: 'Profissional',
    price: '97',
    description: 'Para escritórios em crescimento',
    features: [
      'Até 30 clientes',
      'Tudo do Starter',
      'Alertas por email',
      'Relatórios avançados',
      'Suporte prioritário'
    ],
    cta: 'Começar Teste Grátis',
    featured: true
  },
  {
    name: 'Enterprise',
    price: '297',
    description: 'Para grandes escritórios',
    features: [
      '30+ clientes (ilimitado)',
      'Tudo do Profissional',
      'API de integração',
      'Gerente de conta dedicado',
      'Treinamento da equipe'
    ],
    cta: 'Falar com Vendas',
    featured: false
  }
]

const faqs = [
  {
    question: 'Como funciona o período de teste?',
    answer: 'Você pode começar com o plano Starter gratuitamente, sem cartão de crédito. Se precisar de mais recursos, pode fazer upgrade a qualquer momento com 14 dias de teste grátis.'
  },
  {
    question: 'Meus clientes precisam pagar para acessar?',
    answer: 'Não! Seus clientes acessam o portal gratuitamente. Apenas você, como contador, paga pelo plano escolhido.'
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim, você pode cancelar quando quiser, sem multas ou taxas. Seus dados ficam disponíveis por 30 dias após o cancelamento.'
  },
  {
    question: 'Os dados são seguros?',
    answer: 'Absolutamente. Usamos criptografia de ponta a ponta, servidores seguros no Brasil e fazemos backups diários. Seus dados e de seus clientes estão protegidos.'
  },
  {
    question: 'Preciso instalar algo?',
    answer: 'Não! O DK funciona 100% no navegador. Basta criar sua conta e começar a usar. Funciona em computador, tablet e celular.'
  }
]
</script>

<style scoped lang="scss">
// Variables
$primary: #667eea;
$primary-dark: #5a67d8;
$secondary: #764ba2;
$success: #48bb78;
$warning: #ed8936;
$danger: #f56565;
$dark: #1a202c;
$gray-900: #171923;
$gray-800: #2d3748;
$gray-700: #4a5568;
$gray-600: #718096;
$gray-500: #a0aec0;
$gray-400: #cbd5e0;
$gray-300: #e2e8f0;
$gray-200: #edf2f7;
$gray-100: #f7fafc;

// Mixins
@mixin gradient-text {
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

// Base
.landing {
  min-height: 100vh;
  background: white;
  overflow-x: hidden;
}

// Navbar
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid $gray-200;
  padding: 1rem 2rem;
}

.navbar-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  @include gradient-text;
}

.nav-links {
  display: flex;
  gap: 2rem;

  @media (max-width: 968px) {
    display: none;
  }

  a {
    color: $gray-700;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;

    &:hover {
      color: $primary;
    }
  }
}

.btn-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: $dark;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: $gray-800;
    transform: translateY(-1px);
  }
}

// Hero Section
.hero {
  min-height: 100vh;
  padding: 8rem 2rem 4rem;
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    text-align: center;
    padding-top: 7rem;
  }
}

.hero-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
}

.hero-gradient {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 80%;
  height: 100%;
  background: radial-gradient(circle, rgba($primary, 0.08) 0%, transparent 70%);
}

.hero-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient($gray-300 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.5;
}

.hero-glow {
  position: absolute;
  top: 20%;
  left: 10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba($secondary, 0.1) 0%, transparent 70%);
  filter: blur(60px);
}

.hero-content {
  position: relative;
  z-index: 1;

  @media (max-width: 1200px) {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba($primary, 0.1) 0%, rgba($secondary, 0.1) 100%);
  border: 1px solid rgba($primary, 0.2);
  border-radius: 100px;
  color: $primary;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  color: $dark;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
}

.hero-highlight {
  display: block;
  @include gradient-text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: $gray-600;
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 540px;

  @media (max-width: 1200px) {
    max-width: 600px;
  }
}

.hero-cta {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba($primary, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba($primary, 0.4);
  }
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: transparent;
  color: $gray-700;
  border: 2px solid $gray-300;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: $primary;
    color: $primary;
  }
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: transparent;
  color: $dark;
  border: 2px solid $gray-300;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;

  &:hover {
    border-color: $primary;
    color: $primary;
  }
}

.hero-social-proof {
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 1200px) {
    justify-content: center;
  }
}

.avatars {
  display: flex;

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid white;
    margin-left: -10px;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:first-child {
      margin-left: 0;
    }
  }
}

.social-proof-text {
  .stars {
    display: flex;
    color: #fbbf24;
    margin-bottom: 0.25rem;
  }

  span {
    font-size: 0.875rem;
    color: $gray-600;

    strong {
      color: $dark;
    }
  }
}

// Hero Visual
.hero-visual {
  position: relative;

  @media (max-width: 1200px) {
    display: none;
  }
}

.dashboard-mockup {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid $gray-200;
}

.mockup-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: $gray-100;
  border-bottom: 1px solid $gray-200;
}

.mockup-dots {
  display: flex;
  gap: 0.5rem;

  span {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: $gray-300;

    &:first-child { background: #f56565; }
    &:nth-child(2) { background: #fbbf24; }
    &:last-child { background: #48bb78; }
  }
}

.mockup-title {
  font-size: 0.875rem;
  color: $gray-600;
  font-weight: 500;
}

.mockup-content {
  display: flex;
  min-height: 320px;
}

.mockup-sidebar {
  width: 60px;
  background: $gray-900;
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-item {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $gray-500;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background: linear-gradient(135deg, $primary 0%, $secondary 100%);
    color: white;
  }
}

.mockup-main {
  flex: 1;
  padding: 1.5rem;
  background: $gray-100;
}

.mockup-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 10px;
  border-left: 4px solid $primary;

  &.green { border-left-color: $success; }
  &.orange { border-left-color: $warning; }
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: $dark;
}

.stat-label {
  font-size: 0.75rem;
  color: $gray-600;
}

.mockup-table {
  background: white;
  border-radius: 10px;
  padding: 1rem;
}

.table-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid $gray-200;

  &:last-child { border-bottom: none; }
}

.row-company {
  width: 120px;
  height: 12px;
  background: $gray-300;
  border-radius: 4px;
}

.row-value {
  flex: 1;
  height: 12px;
  background: $gray-200;
  border-radius: 4px;
}

.row-status {
  width: 60px;
  height: 24px;
  border-radius: 12px;

  &.paid { background: rgba($success, 0.2); }
  &.pending { background: rgba($warning, 0.2); }
}

.floating-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  animation: float 3s ease-in-out infinite;

  &.card-1 {
    top: 20%;
    right: -30px;
    animation-delay: 0s;
  }

  &.card-2 {
    bottom: 15%;
    left: -40px;
    animation-delay: 1.5s;
  }

  strong {
    display: block;
    font-size: 0.875rem;
    color: $dark;
  }

  span {
    font-size: 0.75rem;
    color: $gray-600;
  }
}

.card-icon {
  &.green { color: $success; }
  &.orange { color: $warning; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

// Logos Section
.logos-section {
  padding: 4rem 2rem;
  background: $gray-100;
  border-top: 1px solid $gray-200;
  border-bottom: 1px solid $gray-200;
}

.logos-title {
  text-align: center;
  color: $gray-500;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 2rem;
}

.logos-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: $gray-400;
  font-weight: 600;
  font-size: 0.875rem;
}

// Problem Section
.problem-section {
  padding: 8rem 2rem;
  background: $gray-900;
}

.problem-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
}

.section-badge {
  display: inline-flex;
  padding: 0.5rem 1rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.5rem;
  background: rgba($primary, 0.1);
  color: $primary;

  &.red {
    background: rgba($danger, 0.1);
    color: $danger;
  }

  &.green {
    background: rgba($success, 0.1);
    color: $success;
  }
}

.section-title-large {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 2rem;
  color: $dark;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.problem-text {
  color: white;

  .section-title-large {
    color: white;
  }
}

.text-red {
  color: $danger;
}

.text-green {
  color: $success;
}

.problem-list, .solution-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  li {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    font-size: 1.125rem;
  }
}

.problem-list li {
  color: $gray-300;
}

.icon-red {
  color: $danger;
  flex-shrink: 0;
}

.icon-green {
  color: $success;
  flex-shrink: 0;
}

.problem-visual {
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 968px) {
    display: none;
  }
}

.chaos-illustration {
  position: relative;
  width: 400px;
  height: 400px;
}

.chaos-item {
  position: absolute;
  width: 70px;
  height: 70px;
  background: $gray-800;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $gray-500;
  animation: chaos 4s ease-in-out infinite;

  &.email { top: 10%; left: 10%; animation-delay: 0s; }
  &.whatsapp { top: 5%; right: 20%; animation-delay: 0.5s; color: #25d366; }
  &.folder { bottom: 20%; left: 5%; animation-delay: 1s; }
  &.excel { bottom: 10%; right: 10%; animation-delay: 1.5s; color: #217346; }
}

.chaos-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: $danger;

  span {
    font-size: 1.25rem;
    font-weight: 700;
  }
}

@keyframes chaos {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(10px, -10px) rotate(5deg); }
  50% { transform: translate(-5px, 10px) rotate(-3deg); }
  75% { transform: translate(5px, 5px) rotate(2deg); }
}

// Solution Section
.solution-section {
  padding: 8rem 2rem;
  background: white;
}

.solution-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
}

.solution-text {
  color: $dark;
}

.solution-list li {
  color: $gray-700;
}

.solution-visual {
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 968px) {
    display: none;
  }
}

.order-illustration {
  position: relative;
  width: 400px;
  height: 400px;
}

.order-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.dk-logo-large {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 20px 60px rgba($primary, 0.3);
}

.order-orbit {
  position: absolute;
  inset: 0;
  animation: spin 20s linear infinite;
}

.orbit-item {
  position: absolute;
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $primary;

  &:nth-child(1) { top: 0; left: 50%; transform: translateX(-50%); }
  &:nth-child(2) { top: 25%; right: 0; }
  &:nth-child(3) { bottom: 25%; right: 0; }
  &:nth-child(4) { bottom: 0; left: 50%; transform: translateX(-50%); }
  &:nth-child(5) { bottom: 25%; left: 0; }
  &:nth-child(6) { top: 25%; left: 0; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Features Section
.features {
  padding: 8rem 2rem;
  background: $gray-100;
}

.features-content {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-description {
  font-size: 1.25rem;
  color: $gray-600;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid $gray-200;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: $dark;
  margin-bottom: 0.75rem;
}

.feature-description {
  font-size: 1rem;
  color: $gray-600;
  line-height: 1.6;
}

// How It Works Section
.how-it-works {
  padding: 8rem 2rem;
  background: white;
}

.how-it-works-content {
  max-width: 1200px;
  margin: 0 auto;
}

.steps-container {
  position: relative;
  margin-top: 4rem;
}

.steps-line {
  position: absolute;
  top: 80px;
  left: 10%;
  right: 10%;
  height: 4px;
  background: linear-gradient(90deg, $primary 0%, $secondary 100%);
  border-radius: 2px;

  @media (max-width: 968px) {
    display: none;
  }
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  position: relative;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
}

.step-card {
  text-align: center;
  padding: 2rem;
  position: relative;
}

.step-number {
  position: absolute;
  top: 0;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: $gray-200;
  color: $gray-600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
}

.step-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.step-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: $dark;
  margin-bottom: 0.75rem;
}

.step-description {
  font-size: 1rem;
  color: $gray-600;
  line-height: 1.6;
}

// Benefits Section
.benefits {
  padding: 8rem 2rem;
  background: linear-gradient(135deg, $gray-100 0%, white 100%);
}

.benefits-content {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 580px) {
    grid-template-columns: 1fr;
  }
}

.stats-card {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: all 0.3s;
  border: 1px solid $gray-200;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
}

.stats-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-icon {
  color: white;
}

.stats-number {
  font-size: 3rem;
  font-weight: 800;
  color: $dark;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stats-label {
  font-size: 1rem;
  color: $gray-600;
  font-weight: 500;
}

.benefits-list-wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 580px) {
    grid-template-columns: 1fr;
  }
}

.benefit-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid $gray-200;
  transition: all 0.3s;

  &:hover {
    border-color: $primary;
    box-shadow: 0 10px 30px rgba($primary, 0.1);
  }
}

.benefit-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba($primary, 0.1) 0%, rgba($secondary, 0.1) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $primary;
  flex-shrink: 0;
}

.benefit-text {
  h4 {
    font-size: 1rem;
    font-weight: 700;
    color: $dark;
    margin-bottom: 0.25rem;
  }

  p {
    font-size: 0.875rem;
    color: $gray-600;
    line-height: 1.5;
    margin: 0;
  }
}

// Testimonials Section
.testimonials {
  padding: 8rem 2rem;
  background: $gray-900;
}

.testimonials-content {
  max-width: 1200px;
  margin: 0 auto;

  .section-header {
    .section-title-large {
      color: white;
    }
  }
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
}

.testimonial-card {
  background: $gray-800;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid $gray-700;
}

.testimonial-stars {
  display: flex;
  color: #fbbf24;
  margin-bottom: 1rem;
}

.testimonial-text {
  font-size: 1rem;
  color: $gray-300;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
}

.author-info {
  strong {
    display: block;
    color: white;
    font-size: 1rem;
  }

  span {
    color: $gray-500;
    font-size: 0.875rem;
  }
}

// Pricing Section
.pricing {
  padding: 8rem 2rem;
  background: white;
}

.pricing-content {
  max-width: 1200px;
  margin: 0 auto;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  align-items: start;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
}

.pricing-card {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  border: 2px solid $gray-200;
  position: relative;
  transition: all 0.3s;

  &.featured {
    border-color: $primary;
    box-shadow: 0 20px 60px rgba($primary, 0.15);
    transform: scale(1.05);

    @media (max-width: 968px) {
      transform: none;
    }
  }

  &:hover {
    border-color: $primary;
  }
}

.pricing-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 100px;
  text-transform: uppercase;
}

.pricing-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: $dark;
  margin-bottom: 0.5rem;
}

.pricing-price {
  margin-bottom: 0.5rem;
}

.price-currency {
  font-size: 1.5rem;
  font-weight: 700;
  color: $dark;
  vertical-align: top;
}

.price-value {
  font-size: 4rem;
  font-weight: 800;
  color: $dark;
  line-height: 1;
}

.price-period {
  font-size: 1rem;
  color: $gray-500;
}

.pricing-description {
  color: $gray-600;
  margin-bottom: 2rem;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;

  li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    color: $gray-700;
    font-size: 0.95rem;

    svg {
      color: $success;
      flex-shrink: 0;
    }
  }
}

// FAQ Section
.faq {
  padding: 8rem 2rem;
  background: $gray-100;
}

.faq-content {
  max-width: 800px;
  margin: 0 auto;
}

.faq-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  background: white;
  border-radius: 12px;
  border: 1px solid $gray-200;
  overflow: hidden;
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: $dark;
  text-align: left;

  svg {
    color: $gray-500;
    transition: transform 0.3s;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;

  &.open {
    max-height: 200px;
  }

  p {
    padding: 0 1.5rem 1.5rem;
    color: $gray-600;
    line-height: 1.7;
    margin: 0;
  }
}

// Final CTA Section
.final-cta {
  padding: 8rem 2rem;
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  text-align: center;
}

.cta-content {
  max-width: 700px;
  margin: 0 auto;
}

.cta-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.cta-description {
  font-size: 1.25rem;
  color: rgba(white, 0.9);
  line-height: 1.7;
  margin-bottom: 2.5rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.btn-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 2.5rem;
  background: white;
  color: $primary;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
}

.btn-cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 2.5rem;
  background: transparent;
  color: white;
  border: 2px solid rgba(white, 0.5);
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(white, 0.1);
    border-color: white;
  }
}

.cta-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(white, 0.7);
}

// Footer
.footer {
  background: $gray-900;
  color: white;
  padding: 4rem 2rem 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-main {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 4rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid $gray-800;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.footer-brand {
  p {
    color: $gray-500;
    margin-top: 1rem;
    line-height: 1.6;
  }
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 580px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.footer-column {
  h4 {
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: $gray-400;
    margin-bottom: 1rem;
  }

  a {
    display: block;
    color: $gray-500;
    text-decoration: none;
    padding: 0.5rem 0;
    transition: color 0.2s;

    &:hover {
      color: white;
    }
  }
}

.footer-bottom {
  padding-top: 2rem;
  text-align: center;

  p {
    color: $gray-600;
    font-size: 0.875rem;
    margin: 0;
  }
}
</style>
