import { v4 as uuidv4 } from 'uuid';
import { isSameDay } from 'date-fns';
import { db, type ITask } from '../db/db';

export const runTaskScheduler = async (): Promise<void> => {
  const templates = await db.tasks.where('isTemplate').equals(true).toArray();

  if (templates.length === 0) {
    return;
  }

  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)

  const tasksToCreate: ITask[] = [];
  const templatesToUpdate: ITask[] = [];

  for (const template of templates) {
    const shouldRunToday = template.recurrenceDays.includes(currentDayOfWeek);

    if (!shouldRunToday) {
      continue;
    }

    const wasGeneratedToday = template.lastGeneratedAt && isSameDay(new Date(template.lastGeneratedAt), today);

    if (wasGeneratedToday) {
      continue;
    }

    // Find the first column (usually "To Do")
    // For optimization, we could fetch this once outside, but let's be safe inside
    const firstColumn = await db.columns.orderBy('order').first();
    const targetColumnId = firstColumn?.id;

    if (!targetColumnId) {
      console.warn('No columns found to create task.');
      continue;
    }

    const newTask: ITask = {
      id: uuidv4(),
      title: template.title,
      description: template.description,
      columnId: targetColumnId,
      createdAt: new Date(),
      isTemplate: false,
      recurrenceDays: [],
    };

    tasksToCreate.push(newTask);
    
    // Update the template's lastGeneratedAt
    templatesToUpdate.push({
        ...template,
        lastGeneratedAt: new Date()
    });
  }

  if (tasksToCreate.length > 0) {
    await db.tasks.bulkAdd(tasksToCreate);
    await db.tasks.bulkPut(templatesToUpdate);
    console.log(`Generated ${tasksToCreate.length} automated tasks.`);
  }
};
