// src/components/dashboard/gantt-chart.tsx
"use client"

import React, { useMemo, useRef, useState, useEffect } from 'react';
import type { Project, Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { eachDayOfInterval, format, differenceInDays, startOfDay, addDays, getWeek, getMonth, getYear, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Save, Trash2, ArrowRight, Target, Diamond } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { ViewActions } from './view-actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useMobile } from '@/hooks/use-mobile'; // Corrigido

type ZoomLevel = 'day' | 'week' | 'month';

interface GanttChartProps {
  project: Project;
  onSaveBaseline: () => void;
  onDeleteBaseline: () => void;
}

// ... (resto do componente mantido como está) ...

export function GanttChart({ project, onSaveBaseline, onDeleteBaseline }: GanttChartProps) {
  const printableRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<ZoomLevel>('day');
  const isMobile = useMobile(); // Corrigido

  useEffect(() => {
    if (isMobile) {
        setZoom('month');
    }
  }, [isMobile]);
  
  // ... (resto da lógica do componente mantida) ...
}
