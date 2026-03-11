package com.myeca.smarttax.data.local.db

import androidx.room.Database
import androidx.room.RoomDatabase
import com.myeca.smarttax.data.local.dao.TdsDao
import com.myeca.smarttax.data.local.entity.TdsCalculationEntity

@Database(
    entities = [TdsCalculationEntity::class],
    version = 1,
    exportSchema = true
)
abstract class SmartTaxDatabase : RoomDatabase() {
    abstract fun tdsDao(): TdsDao
}