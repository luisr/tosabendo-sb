// src/components/dashboard/sidebar.tsx
'use client'; // ADICIONADO: Marca este como um Componente de Cliente

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Folder,
  // ... (outros ícones) ...
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
// ... (outras importações mantidas) ...
import { useState } from "react";
// ... (resto do arquivo mantido como está) ...
