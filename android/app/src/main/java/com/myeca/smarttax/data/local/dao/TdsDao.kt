package com.myeca.smarttax.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.myeca.smarttax.data.local.entity.TdsCalculationEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TdsDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(calculation: TdsCalculationEntity): Long

    @Query("SELECT * FROM tds_calculations ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentCalculations(limit: Int = 20): Flow<List<TdsCalculationEntity>>

    @Query("DELETE FROM tds_calculations")
    suspend fun clearAll()
}